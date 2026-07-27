import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { RedisService } from '../redis/redis.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { OtpPurpose } from './otp-purpose.type';
import { ResetTokenPayload } from './reset-token-payload.interface';

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
    private readonly jwtService: JwtService,
    @InjectQueue('mail-queue')
    private readonly mailQueue: Queue,
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

  private async issueSessionToken(user: User): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
      phone: user.phone,
    });
  }

  async sendOtp(
    phone: string,
    purpose: OtpPurpose = 'login',
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

    // If identifier is an email address, queue an async OTP email job via BullMQ
    if (phone.includes('@')) {
      try {
        await this.mailQueue.add('send-otp', {
          email: phone,
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
    token?: string;
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
      return {
        verified: false,
        message: 'OTP has expired or does not exist. Please request a new one.',
      };
    }

    if (savedRecord.code !== code) {
      return {
        verified: false,
        message: 'Invalid OTP code. Please try again.',
      };
    }

    // Defense in depth: if the caller specified what it expected this OTP to be
    // for, reject a mismatch rather than trusting the stored purpose blindly.
    if (savedRecord.purpose !== purpose) {
      return {
        verified: false,
        message: 'Invalid OTP code. Please try again.',
      };
    }

    if (savedRecord.purpose === 'reset') {
      const user =
        (await this.usersService.findByPhone(phone)) ??
        (await this.usersService.findByEmail(phone));
      if (!user) {
        return {
          verified: false,
          message: 'No account found for this identifier.',
        };
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
      const user = await this.usersService.findByPhone(phone);
      if (!user) {
        return {
          verified: false,
          message: 'No account found for this identifier.',
        };
      }
      await this.usersService.markVerified(user.id);
      const token = await this.issueSessionToken(user);
      return {
        verified: true,
        token,
        user: this.toPublicUser({ ...user, verified: true }),
        message: 'OTP verified successfully.',
      };
    }

    // purpose === 'login': preserve original auto-register-on-first-verify behavior
    const user = await this.usersService.findOrCreateByPhone(phone);
    const token = await this.issueSessionToken(user);
    return {
      verified: true,
      token,
      user: this.toPublicUser(user),
      message: 'OTP verified successfully.',
    };
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ success: boolean; message: string }> {
    const existingByPhone = await this.usersService.findByPhone(dto.phone);
    if (existingByPhone) {
      throw new ConflictException(
        'An account with this phone number already exists.',
      );
    }
    if (dto.email) {
      const existingByEmail = await this.usersService.findByEmail(dto.email);
      if (existingByEmail) {
        throw new ConflictException(
          'An account with this email already exists.',
        );
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.usersService.createWithPassword({
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      role: dto.role,
      passwordHash,
    });

    await this.sendOtp(dto.phone, 'verify');

    return {
      success: true,
      message:
        'Registered successfully. Please verify your phone number with the OTP sent to you.',
    };
  }

  async login(
    identifier: string,
    password: string,
  ): Promise<{ token: string; user: Partial<User> }> {
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

    const token = await this.issueSessionToken(user);
    return { token, user: this.toPublicUser(user) };
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
  ): Promise<{ token: string; user: Partial<User> }> {
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
    const token = await this.issueSessionToken(user);
    return { token, user: this.toPublicUser(user) };
  }

  async loginWithFacebook(
    accessToken: string,
  ): Promise<{ token: string; user: Partial<User> }> {
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
    const token = await this.issueSessionToken(user);
    return { token, user: this.toPublicUser(user) };
  }
}
