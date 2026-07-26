import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

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
}
