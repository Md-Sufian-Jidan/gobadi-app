import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { PaginatedResult } from '../common/paginated-result.interface';

interface CreateWithPasswordInput {
  name?: string;
  phone: string;
  email?: string;
  role: UserRole;
  passwordHash: string;
}

interface FindOrCreateByOAuthInput {
  provider: 'google' | 'facebook';
  providerId: string;
  email?: string;
  name?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOrCreateByPhone(
    phone: string,
    defaultRole: UserRole = UserRole.PATIENT,
  ): Promise<User> {
    const existing = await this.userRepository.findOneBy({ phone });
    if (existing) {
      return existing;
    }
    const newUser = this.userRepository.create({ phone, role: defaultRole });
    return this.userRepository.save(newUser);
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOneBy({ phone });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async updateProfile(
    userId: number,
    data: { name?: string; email?: string },
  ): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (data.email && data.email !== user.email) {
      const existing = await this.userRepository.findOneBy({ email: data.email });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }
    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  /** Looks up a user by phone or email, including the normally-hidden password hash. */
  async findByIdentifierWithPassword(identifier: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.phone = :identifier OR user.email = :identifier', {
        identifier,
      })
      .getOne();
  }

  async createWithPassword(input: CreateWithPasswordInput): Promise<User> {
    const newUser = this.userRepository.create({
      name: input.name,
      phone: input.phone,
      email: input.email,
      role: input.role,
      password: input.passwordHash,
    });
    return this.userRepository.save(newUser);
  }

  async findOrCreateByOAuth(input: FindOrCreateByOAuthInput): Promise<User> {
    const idColumn = input.provider === 'google' ? 'googleId' : 'facebookId';

    const existingByProvider = await this.userRepository.findOneBy({
      [idColumn]: input.providerId,
    });
    if (existingByProvider) {
      return existingByProvider;
    }

    if (input.email) {
      const existingByEmail = await this.userRepository.findOneBy({
        email: input.email,
      });
      if (existingByEmail) {
        existingByEmail[idColumn] = input.providerId;
        return this.userRepository.save(existingByEmail);
      }
    }

    const newUser = this.userRepository.create({
      name: input.name,
      email: input.email,
      phone: `${input.provider}:${input.providerId}`,
      role: UserRole.PATIENT,
      verified: true,
      [idColumn]: input.providerId,
    } as Partial<User>);
    return this.userRepository.save(newUser);
  }

  async setPassword(userId: number, passwordHash: string): Promise<void> {
    await this.userRepository.update(userId, { password: passwordHash });
  }

  async markVerified(userId: number): Promise<void> {
    await this.userRepository.update(userId, { verified: true });
  }

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedResult<User>> {
    const where = search
      ? [{ name: ILike(`%${search}%`) }, { phone: ILike(`%${search}%`) }, { email: ILike(`%${search}%`) }]
      : {};
    const [data, total] = await this.userRepository.findAndCount({
      where,
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, page, limit, total };
  }

  async updateRole(id: number, role: UserRole): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.role = role;
    return this.userRepository.save(user);
  }
}
