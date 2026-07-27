import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Animal } from '../animals/animal.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Availability } from '../doctors/availability.entity';
import { MarketItem } from '../marketplace/market-item.entity';
import { ChatMessage, MessageStatus } from '../chat/chat-message.entity';
import { Conversation } from '../chat/conversation.entity';
import { User, UserRole } from '../users/user.entity';

// Demo credentials for local/manual testing only — logged once at startup
// so whoever runs the seeded backend can log in immediately without an OTP.
export const SEED_PASSWORD = 'Password123!';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Animal)
    private readonly animalRepository: Repository<Animal>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectRepository(MarketItem)
    private readonly marketItemRepository: Repository<MarketItem>,
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    this.logger.log('Checking database status to run seeder...');
    const users = await this.seedUsers();
    await this.seedDoctors(users);
    await this.seedAvailability();
    await this.seedAnimals();
    await this.seedMarketItems();
    await this.seedChatMessages(users);
    await this.backfillDemoLoginCredentials();
    this.logger.log('Database seeding checks completed successfully!');
  }

  /**
   * Grants the demo doctor/patient a known password even on databases that
   * were already seeded before login credentials existed — seedUsers() only
   * runs once against an empty table, so pre-existing installs need this
   * separate idempotent backfill to gain the same test login.
   */
  private async backfillDemoLoginCredentials(): Promise<void> {
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    const demoAccounts = [
      { phone: '+8801700000001', email: 'doctor@gobadi.test' },
      { phone: '+8801800000001', email: 'patient@gobadi.test' },
    ];
    let backfilled = false;
    for (const account of demoAccounts) {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.phone = :phone', { phone: account.phone })
        .getOne();
      if (user && !user.password) {
        await this.userRepository.update(user.id, {
          email: user.email ?? account.email,
          password: passwordHash,
          verified: true,
        });
        backfilled = true;
      }
    }
    if (backfilled) {
      this.logger.log(
        `Backfilled login credentials — doctor@gobadi.test / patient@gobadi.test, password: ${SEED_PASSWORD}`,
      );
    }
  }

  private async seedUsers(): Promise<User[]> {
    const count = await this.userRepository.count();
    if (count === 0) {
      this.logger.log('Seeding users...');
      const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
      const users = await this.userRepository.save([
        {
          phone: '+8801700000001',
          email: 'doctor@gobadi.test',
          role: UserRole.DOCTOR,
          name: 'Dr. Michael Wilson',
          password: passwordHash,
          verified: true,
        },
        {
          phone: '+8801700000002',
          role: UserRole.DOCTOR,
          name: 'Dr. Jessica Taylor',
        },
        {
          phone: '+8801800000001',
          email: 'patient@gobadi.test',
          role: UserRole.PATIENT,
          name: 'Test Patient One',
          password: passwordHash,
          verified: true,
        },
        {
          phone: '+8801800000002',
          role: UserRole.PATIENT,
          name: 'Test Patient Two',
        },
      ]);
      this.logger.log(
        `Seeded login credentials — doctor@gobadi.test / patient@gobadi.test, password: ${SEED_PASSWORD}`,
      );
      return users;
    }
    return this.userRepository.find();
  }

  private async seedDoctors(users: User[]): Promise<void> {
    const count = await this.doctorRepository.count();
    if (count === 0) {
      this.logger.log('Seeding doctors...');
      const doctorUsers = users.filter((u) => u.role === UserRole.DOCTOR);
      await this.doctorRepository.save([
        {
          userId: doctorUsers[0]?.id ?? null,
          name: 'Dr. Michael Wilson',
          specialty: 'Veterinary Surgeon',
          experience: '8 Years',
          rating: 4.8,
          avatar: 'michael_doctor.png',
          bio: 'Dr. Michael has spent over 8 years caring for farm animals, specialized in large cattle surgery and herd management.',
        },
        {
          userId: doctorUsers[1]?.id ?? null,
          name: 'Dr. Jessica Taylor',
          specialty: 'Animal Nutritionist',
          experience: '6 Years',
          rating: 4.9,
          avatar: 'jessica_doctor.png',
          bio: 'Dr. Jessica specializes in optimal nutrition and disease prevention for cows, goats, and sheep.',
        },
      ]);
    }
  }

  private async seedAvailability(): Promise<void> {
    const count = await this.availabilityRepository.count();
    if (count === 0) {
      this.logger.log('Seeding doctor availability (Mon-Fri, 09:00-17:00)...');
      const doctors = await this.doctorRepository.find();
      const weekdays = [1, 2, 3, 4, 5]; // Mon-Fri
      const entries = doctors.flatMap((doctor) =>
        weekdays.map((dayOfWeek) => ({
          doctorId: doctor.id,
          dayOfWeek,
          startTime: '09:00',
          endTime: '17:00',
          slotDurationMinutes: 30,
          bufferMinutes: 10,
        })),
      );
      await this.availabilityRepository.save(entries);
    }
  }

  private async seedAnimals() {
    const count = await this.animalRepository.count();
    if (count === 0) {
      this.logger.log('Seeding animals...');
      await this.animalRepository.save([
        {
          name: 'Donald Tramp',
          breed: 'Albino Buffalo',
          weight: '725 Kg',
          age: '28 Months',
          color: 'Pinkish White',
        },
        {
          name: 'Kabir Cow',
          breed: 'Bangladeshi Cow',
          weight: '650 Kg',
          age: '24 Months',
          color: 'Brown',
        },
      ]);
    }
  }

  private async seedMarketItems() {
    const count = await this.marketItemRepository.count();
    if (count === 0) {
      this.logger.log('Seeding marketplace catalog...');
      await this.marketItemRepository.save([
        {
          name: 'Cattle Bhushi Mix Feed',
          price: 1350,
          category: 'Feeds',
          image: 'feed.png',
        },
        {
          name: 'Premium Milk Pail',
          price: 850,
          category: 'Milk',
          image: 'milk.png',
        },
        {
          name: 'Albenian Buffalo',
          price: 320000,
          category: 'Animals',
          image: 'albino_buffalo.png',
        },
        {
          name: 'Pure Mutton Cuts',
          price: 1200,
          category: 'Meat',
          image: 'meat.png',
        },
      ]);
    }
  }

  private async seedChatMessages(users: User[]) {
    const count = await this.chatMessageRepository.count();
    if (count === 0) {
      const doctor = await this.doctorRepository.findOne({
        where: {},
        order: { id: 'ASC' },
      });
      const patient = users.find((u) => u.role === UserRole.PATIENT);
      if (!doctor || !patient) {
        return;
      }

      this.logger.log('Seeding a demo conversation and chat messages...');
      const conversation = await this.conversationRepository.save({
        doctorId: doctor.id,
        doctorUserId: doctor.userId ?? null,
        patientId: patient.id,
        lastMessageAt: new Date(),
      });

      await this.chatMessageRepository.save([
        {
          conversationId: conversation.id,
          senderId: doctor.userId ?? doctor.id,
          senderRole: UserRole.DOCTOR,
          text: 'Hello, how can I help you and your animal today?',
          status: MessageStatus.READ,
        },
        {
          conversationId: conversation.id,
          senderId: patient.id,
          senderRole: UserRole.PATIENT,
          text: 'Thank you for reaching out!\nWe are looking for a surgery.',
          status: MessageStatus.DELIVERED,
        },
      ]);
    }
  }
}
