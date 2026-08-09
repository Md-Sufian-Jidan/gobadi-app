import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { RedisService } from '../redis/redis.service';
import { UsersService } from '../users/users.service';
import { DoctorsService } from '../doctors/doctors.service';
import { User, UserRole } from '../users/user.entity';
import { RefreshToken } from './refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { OtpPurpose } from './otp-purpose.type';
import { ResetTokenPayload } from './reset-token-payload.interface';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const ACCESS_TOKEN_EXPIRES_IN = '15m';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface OtpRecord {
  code: string;
  purpose: OtpPurpose;
}

@Injectable()
export class AuthService {
  // In-memory fallback if Redis is unavailable
  private otpMemoryFallback = new Map<
    string,
    { record: OtpRecord; expiresAt: number }
  >();

  constructor(
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,
    private readonly doctorsService: DoctorsService,
    private readonly jwtService: JwtService,
    @InjectQueue('mail-queue')
    private readonly mailQueue: Queue,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  private toPublicUser(user: User): Partial<User> {
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
      name: user.name,
      verified: user.verified,
    };
  }

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private async issueAccessToken(user: User): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        phone: user.phone,
      },
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
    );
  }

  private async issueRefreshToken(userId: number): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = this.refreshTokenRepository.create({
      userId,
      tokenHash: this.hashToken(rawToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
    await this.refreshTokenRepository.save(refreshToken);
    return rawToken;
  }

  private async issueTokenPair(user: User): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.issueAccessToken(user),
      this.issueRefreshToken(user.id),
    ]);
    return { accessToken, refreshToken };
  }

  async refreshTokens(rawRefreshToken: string): Promise<TokenPair> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    const tokenHash = this.hashToken(rawRefreshToken);
    const existing = await this.refreshTokenRepository.findOneBy({
      tokenHash,
    });
    if (
      !existing ||
      existing.revokedAt ||
      existing.expiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(existing.userId);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate: revoke the used token before issuing a new pair so a stolen
    // refresh token cannot be replayed after the legitimate client rotates.
    await this.refreshTokenRepository.update(existing.id, {
      revokedAt: new Date(),
    });
    return this.issueTokenPair(user);
  }

  async logout(rawRefreshToken: string): Promise<{ success: boolean }> {
    if (!rawRefreshToken) {
      return { success: true };
    }
    const tokenHash = this.hashToken(rawRefreshToken);
    const existing = await this.refreshTokenRepository.findOneBy({
      tokenHash,
    });
    if (
      !existing ||
      existing.revokedAt ||
      existing.expiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    await this.refreshTokenRepository.update(existing.id, {
      revokedAt: new Date(),
    });
    return { success: true };
  }

  async sendOtp(
    phone: string,
    purpose: OtpPurpose = 'login',
    notifyEmail?: string,
  ): Promise<{ success: boolean; message: string; otp?: string }> {
    if (!phone) {
      throw new BadRequestException('Phone number or email is required');
    }

    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expirySeconds = 300; // 5 minutes
    const record: OtpRecord = { code: otp, purpose };

    // Try storing in Redis
    try {
      await this.redisService.set(
        `otp:${phone}`,
        JSON.stringify(record),
        expirySeconds,
      );
    } catch {
      // Fallback to in-memory store
      this.otpMemoryFallback.set(phone, {
        record,
        expiresAt: Date.now() + expirySeconds * 1000,
      });
    }

    // If the identifier is an email, or a separate email was supplied
    // alongside a phone identifier, queue an async OTP email job via BullMQ
    // so the code reaches every channel the user registered with.
    const emailTarget = phone.includes('@') ? phone : notifyEmail;
    if (emailTarget) {
      try {
        await this.mailQueue.add('send-otp', {
          email: emailTarget,
          otp,
        });
      } catch (err) {
        console.warn('Failed to queue send-otp email job', err);
      }
    }

    return {
      success: true,
      message: `OTP sent successfully to ${phone}`,
      // Only surface the OTP outside production, for local/manual testing convenience.
      ...(process.env.NODE_ENV !== 'production' ? { otp } : {}),
    };
  }

  async verifyOtp(
    phone: string,
    code: string,
    purpose: OtpPurpose = 'login',
  ): Promise<{
    verified: boolean;
    accessToken?: string;
    refreshToken?: string;
    resetToken?: string;
    user?: Partial<User>;
    message: string;
  }> {
    if (!phone || !code) {
      throw new BadRequestException('Phone number and OTP code are required');
    }

    let savedRecord: OtpRecord | null = null;

    try {
      const raw = await this.redisService.get(`otp:${phone}`);
      if (raw) {
        savedRecord = JSON.parse(raw) as OtpRecord;
        await this.redisService.del(`otp:${phone}`);
      }
    } catch {
      // Fallback lookup
      const entry = this.otpMemoryFallback.get(phone);
      if (entry && entry.expiresAt > Date.now()) {
        savedRecord = entry.record;
        this.otpMemoryFallback.delete(phone);
      }
    }

    if (!savedRecord) {
      throw new BadRequestException(
        'OTP has expired or does not exist. Please request a new one.',
      );
    }

    if (savedRecord.code !== code) {
      throw new BadRequestException('Invalid OTP code. Please try again.');
    }

    // Defense in depth: if the caller specified what it expected this OTP to be
    // for, reject a mismatch rather than trusting the stored purpose blindly.
    if (savedRecord.purpose !== purpose) {
      throw new BadRequestException('Invalid OTP code. Please try again.');
    }

    if (savedRecord.purpose === 'reset') {
      const user =
        (await this.usersService.findByPhone(phone)) ??
        (await this.usersService.findByEmail(phone));
      if (!user) {
        throw new BadRequestException('No account found for this identifier.');
      }
      const resetToken = await this.jwtService.signAsync(
        { sub: user.id, purpose: 'password-reset' } satisfies ResetTokenPayload,
        { expiresIn: '10m' },
      );
      return {
        verified: true,
        resetToken,
        message: 'OTP verified successfully.',
      };
    }

    if (savedRecord.purpose === 'verify') {
      const user =
        (await this.usersService.findByPhone(phone)) ??
        (await this.usersService.findByEmail(phone));
      if (!user) {
        throw new BadRequestException('No account found for this identifier.');
      }
      await this.usersService.markVerified(user.id);
      if (user.role === UserRole.DOCTOR) {
        await this.doctorsService.createProfileForUser(user);
      }
      const { accessToken, refreshToken } = await this.issueTokenPair(user);
      return {
        verified: true,
        accessToken,
        refreshToken,
        user: this.toPublicUser({ ...user, verified: true }),
        message: 'OTP verified successfully.',
      };
    }

    // purpose === 'login': preserve original auto-register-on-first-verify behavior
    const user = await this.usersService.findOrCreateByPhone(phone);
    const { accessToken, refreshToken } = await this.issueTokenPair(user);
    return {
      verified: true,
      accessToken,
      refreshToken,
      user: this.toPublicUser(user),
      message: 'OTP verified successfully.',
    };
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ success: boolean; message: string }> {
    const isEmail = dto.identifier.includes('@');
    const existing = isEmail
      ? await this.usersService.findByEmail(dto.identifier)
      : await this.usersService.findByPhone(dto.identifier);
    if (existing) {
      throw new ConflictException(
        isEmail
          ? 'An account with this email already exists.'
          : 'An account with this phone number already exists.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.usersService.createWithPassword({
      name: dto.name,
      phone: isEmail ? undefined : dto.identifier,
      email: isEmail ? dto.identifier : undefined,
      role: dto.role,
      passwordHash,
    });

    await this.sendOtp(dto.identifier, 'verify');

    return {
      success: true,
      message:
        'Registered successfully. Please verify your account with the code sent to you.',
    };
  }

  async login(
    identifier: string,
    password: string,
  ): Promise<TokenPair & { user: Partial<User> }> {
    const user =
      await this.usersService.findByIdentifierWithPassword(identifier);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.verified) {
      throw new ForbiddenException(
        'Please verify your account before signing in.',
      );
    }

    const { accessToken, refreshToken } = await this.issueTokenPair(user);
    return { accessToken, refreshToken, user: this.toPublicUser(user) };
  }

  async forgotPassword(
    identifier: string,
  ): Promise<{ success: boolean; message: string }> {
    const user =
      (await this.usersService.findByPhone(identifier)) ??
      (await this.usersService.findByEmail(identifier));
    if (!user) {
      // Do not reveal whether the account exists.
      return {
        success: true,
        message:
          'If an account exists for this identifier, a reset code has been sent.',
      };
    }
    await this.sendOtp(identifier, 'reset');
    return {
      success: true,
      message:
        'If an account exists for this identifier, a reset code has been sent.',
    };
  }

  async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    let payload: ResetTokenPayload;
    try {
      payload =
        await this.jwtService.verifyAsync<ResetTokenPayload>(resetToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token.');
    }
    if (payload.purpose !== 'password-reset') {
      throw new UnauthorizedException('Invalid reset token.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.setPassword(payload.sub, passwordHash);
    return { success: true, message: 'Password reset successfully.' };
  }

  async loginWithGoogle(
    idToken: string,
  ): Promise<TokenPair & { user: Partial<User> }> {
    const audience = [
      process.env.GOOGLE_CLIENT_ID_WEB,
      process.env.GOOGLE_CLIENT_ID_IOS,
      process.env.GOOGLE_CLIENT_ID_ANDROID,
    ].filter((id): id is string => Boolean(id));
    const client = new OAuth2Client();

    const payload = await (async () => {
      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience,
        });
        return ticket.getPayload();
      } catch {
        throw new UnauthorizedException('Invalid Google token.');
      }
    })();
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid Google token.');
    }

    const user = await this.usersService.findOrCreateByOAuth({
      provider: 'google',
      providerId: payload.sub,
      email: payload.email,
      name: payload.name,
    });
    const { accessToken, refreshToken } = await this.issueTokenPair(user);
    return { accessToken, refreshToken, user: this.toPublicUser(user) };
  }

  async loginWithFacebook(
    accessToken: string,
  ): Promise<TokenPair & { user: Partial<User> }> {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const debugResponse = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(`${appId}|${appSecret}`)}`,
    );
    const debugBody = (await debugResponse.json().catch(() => null)) as {
      data?: { is_valid?: boolean; app_id?: string };
    } | null;
    if (
      !debugResponse.ok ||
      !debugBody?.data?.is_valid ||
      debugBody.data.app_id !== appId
    ) {
      throw new UnauthorizedException('Invalid Facebook token.');
    }

    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`,
    );
    if (!response.ok) {
      throw new UnauthorizedException('Invalid Facebook token.');
    }
    const profile = (await response.json()) as {
      id: string;
      name?: string;
      email?: string;
    };
    if (!profile?.id) {
      throw new UnauthorizedException('Invalid Facebook token.');
    }

    const user = await this.usersService.findOrCreateByOAuth({
      provider: 'facebook',
      providerId: profile.id,
      email: profile.email,
      name: profile.name,
    });
    const tokenPair = await this.issueTokenPair(user);
    return { ...tokenPair, user: this.toPublicUser(user) };
  }
}
