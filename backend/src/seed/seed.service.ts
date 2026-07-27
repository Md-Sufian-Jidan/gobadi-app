import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Animal } from '../animals/animal.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Availability } from '../doctors/availability.entity';
import { ChatMessage, MessageStatus } from '../chat/chat-message.entity';
import { Conversation } from '../chat/conversation.entity';
import { User, UserRole } from '../users/user.entity';

import { Category } from '../products/category.entity';
import { Brand } from '../products/brand.entity';
import { Product } from '../products/product.entity';
import {
  InventoryLedger,
  InventoryMovementType,
} from '../products/inventory-ledger.entity';
import { Livestock, LivestockStatus } from '../livestock/livestock.entity';
import { Clinic } from '../clinics/clinic.entity';
import { Service, ProviderType } from '../services/service.entity';
import { Address } from '../addresses/address.entity';
import { CartItem } from '../cart/cart-item.entity';
import { WishlistItem } from '../wishlist/wishlist-item.entity';
import { Order, OrderStatus } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Transaction, PaymentStatus } from '../payments/transaction.entity';
import { Delivery, DeliveryStatus } from '../delivery/delivery.entity';
import { Review, ReviewTargetType } from '../reviews/review.entity';
import {
  Notification,
  NotificationType,
} from '../notifications/notification.entity';
import { AiDiagnosis } from '../ai-diagnosis/ai-diagnosis.entity';

export const SEED_PASSWORD = 'Password123!';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Animal)
    private readonly animalRepository: Repository<Animal>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(InventoryLedger)
    private readonly ledgerRepository: Repository<InventoryLedger>,
    @InjectRepository(Livestock)
    private readonly livestockRepository: Repository<Livestock>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(WishlistItem)
    private readonly wishlistItemRepository: Repository<WishlistItem>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(AiDiagnosis)
    private readonly aiDiagnosisRepository: Repository<AiDiagnosis>,
  ) {}

  async onModuleInit() {
    this.logger.log('Checking database status to run seeder...');
    const users = await this.seedUsers();
    const doctors = await this.seedDoctors(users);
    await this.seedAvailability();
    await this.seedAnimals();
    await this.seedCategoriesAndBrandsAndProducts();
    await this.seedClinicsAndServices(users, doctors);
    await this.seedLivestock(users);
    await this.seedChatMessages(users);
    await this.seedCommerceAndEngagementData(users, doctors);
    await this.backfillDemoLoginCredentials();
    this.logger.log('Database seeding checks completed successfully!');
  }

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
          password: passwordHash,
          verified: true,
        },
        {
          phone: '+8801800000001',
          email: 'patient@gobadi.test',
          role: UserRole.USER,
          name: 'Test Farmer Patient',
          password: passwordHash,
          verified: true,
        },
        {
          phone: '+8801800000002',
          role: UserRole.CLINIC,
          name: 'Savar Clinic Manager',
          password: passwordHash,
          verified: true,
        },
        {
          phone: '+8801900000001',
          role: UserRole.ADMIN,
          name: 'Admin Supervisor',
          password: passwordHash,
          verified: true,
        },
      ]);
      return users;
    }
    return this.userRepository.find();
  }

  private async seedDoctors(users: User[]): Promise<Doctor[]> {
    const count = await this.doctorRepository.count();
    if (count === 0) {
      this.logger.log('Seeding doctors...');
      const doctorUsers = users.filter((u) => u.role === UserRole.DOCTOR);
      return this.doctorRepository.save([
        {
          userId: doctorUsers[0]?.id ?? null,
          name: 'Dr. Michael Wilson',
          specialty: 'Veterinary Surgeon',
          experience: '8 Years',
          rating: 4.8,
          avatar: 'michael_doctor.png',
          bio: 'Dr. Michael has spent over 8 years caring for farm animals, specialized in large cattle surgery and herd management.',
          qualifications: ['DVM, BAU', 'MS in Large Animal Surgery'],
          licenseNumber: 'VET-LIC-8821',
          consultationFee: 800,
          isVerified: true,
        },
        {
          userId: doctorUsers[1]?.id ?? null,
          name: 'Dr. Jessica Taylor',
          specialty: 'Animal Nutritionist',
          experience: '6 Years',
          rating: 4.9,
          avatar: 'jessica_doctor.png',
          bio: 'Dr. Jessica specializes in optimal nutrition and disease prevention for cows, goats, and sheep.',
          qualifications: ['DVM, BAU', 'MS in Animal Nutrition'],
          licenseNumber: 'VET-LIC-9932',
          consultationFee: 600,
          isVerified: true,
        },
      ]);
    }
    return this.doctorRepository.find();
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

  private async seedCategoriesAndBrandsAndProducts() {
    const catCount = await this.categoryRepository.count();
    if (catCount === 0) {
      this.logger.log('Seeding products, categories, and brands...');
      const cats = await this.categoryRepository.save([
        {
          name: 'Medicine & Vaccines',
          slug: 'medicine-vaccines',
          description: 'Antibiotics, vaccines, and supplements',
        },
        {
          name: 'Feeds & Supplements',
          slug: 'feeds-supplements',
          description: 'Animal feeds, bhushi, and growth boosters',
        },
        {
          name: 'Tools & Accessories',
          slug: 'tools-accessories',
          description: 'Ear tags, milk pails, and farm machinery',
        },
      ]);

      const brands = await this.brandRepository.save([
        {
          name: 'Renata Animal Health',
          slug: 'renata-animal-health',
          logo: 'renata.png',
          website: 'https://renata-ltd.com',
        },
        {
          name: 'ACI Animal Health',
          slug: 'aci-animal-health',
          logo: 'aci.png',
          website: 'https://aci-bd.com',
        },
        {
          name: 'Square Vet',
          slug: 'square-vet',
          logo: 'square.png',
          website: 'https://squarepharma.com.bd',
        },
      ]);

      const prods = await this.productRepository.save([
        {
          name: 'Renadex Injection 100ml',
          sku: 'MED-REN-001',
          price: 260,
          discount: 15,
          images: ['renadex.png'],
          description:
            'Effective rehydration and support injection for weak cattle.',
          categoryId: cats[0].id,
          brandId: brands[0].id,
          isPublished: true,
        },
        {
          name: 'ACI Cattle Feed Premium Mix 25kg',
          sku: 'FED-ACI-002',
          price: 1350,
          discount: 50,
          images: ['cattle_feed.png'],
          description:
            'Balanced feed formulated to boost milk production in dairy cows.',
          categoryId: cats[1].id,
          brandId: brands[1].id,
          isPublished: true,
        },
        {
          name: 'Square Dewormer Bolus',
          sku: 'MED-SQ-003',
          price: 45,
          discount: 0,
          images: ['dewormer.png'],
          description: 'Broad spectrum dewormer tablet for goats and cows.',
          categoryId: cats[0].id,
          brandId: brands[2].id,
          isPublished: true,
        },
      ]);

      // Seed initial stock ledger additions
      const stockAdditions = [
        {
          productId: prods[0].id,
          quantity: 150,
          movementType: InventoryMovementType.ADDITION,
          description: 'Initial import stock',
        },
        {
          productId: prods[1].id,
          quantity: 80,
          movementType: InventoryMovementType.ADDITION,
          description: 'Initial warehouse arrival',
        },
        {
          productId: prods[2].id,
          quantity: 1200,
          movementType: InventoryMovementType.ADDITION,
          description: 'Initial pharmacy stock',
        },
      ];
      await this.ledgerRepository.save(stockAdditions);
    }
  }

  private async seedClinicsAndServices(users: User[], doctors: Doctor[]) {
    const count = await this.clinicRepository.count();
    if (count === 0) {
      this.logger.log('Seeding clinics and consultation services...');
      const clinicManager =
        users.find((u) => u.role === UserRole.CLINIC) || users[0];

      const clinic = await this.clinicRepository.save({
        userId: clinicManager.id,
        name: 'Savar Central Veterinary Clinic',
        location: 'Dhaka - Aricha Hwy, Savar',
        description:
          'Comprehensive medical care, diagnostic lab, and surgery suite for all livestock species.',
        isVerified: true,
        rating: 4.9,
        avatar: 'savar_clinic.png',
        businessHours: { mon_fri: '08:00 - 20:00', sat_sun: '09:00 - 15:00' },
        doctors, // Link seeded doctors
      });

      // Seed consulting services
      await this.serviceRepository.save([
        {
          providerType: ProviderType.CLINIC,
          providerId: clinic.id,
          name: 'Cattle Vaccination & Deworming Package',
          description: 'Full herd diagnostic and immunization package.',
          price: 1800,
          durationMinutes: 45,
          isOnline: false,
          isOffline: true,
          location: clinic.location,
          isActive: true,
        },
        {
          providerType: ProviderType.DOCTOR,
          providerId: doctors[0].id,
          name: 'Large Cattle Surgical Consult',
          description:
            'Emergency and scheduled surgical consultation for cattle.',
          price: 1000,
          durationMinutes: 30,
          isOnline: true,
          isOffline: true,
          isActive: true,
        },
      ]);
    }
  }

  private async seedLivestock(users: User[]) {
    const count = await this.livestockRepository.count();
    if (count === 0) {
      this.logger.log('Seeding livestock marketplace listings...');
      const farmer = users.find((u) => u.role === UserRole.USER) || users[0];

      await this.livestockRepository.save([
        {
          sellerId: farmer.id,
          species: 'cow',
          breed: 'Friesian Crossbreed',
          price: 320000,
          age: '24 Months',
          weight: 520,
          gender: 'male',
          images: ['friesian_cow.jpg'],
          videos: [],
          location: 'Savar, Dhaka',
          isSold: false,
          isReserved: false,
          status: LivestockStatus.PUBLISHED,
          healthStatus: 'Healthy',
          farmName: 'Savar Dairy Farm',
          createdAt: new Date(),
        },
        {
          sellerId: farmer.id,
          species: 'goat',
          breed: 'Black Bengal',
          price: 28000,
          age: '12 Months',
          weight: 38,
          gender: 'female',
          images: ['black_bengal_goat.jpg'],
          videos: [],
          location: 'Manikganj, Dhaka',
          isSold: false,
          isReserved: false,
          status: LivestockStatus.PUBLISHED,
          healthStatus: 'Healthy',
          farmName: 'Black Bengal Farm',
          createdAt: new Date(),
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
      const patient = users.find((u) => u.role === UserRole.USER);
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
          senderRole: UserRole.USER,
          text: 'Thank you for reaching out!\nWe are looking for a surgery.',
          status: MessageStatus.DELIVERED,
        },
      ]);
    }
  }

  private async seedCommerceAndEngagementData(
    users: User[],
    doctors: Doctor[],
  ) {
    const count = await this.addressRepository.count();
    if (count > 0) {
      return;
    }

    const farmer = users.find((u) => u.role === UserRole.USER) || users[0];
    const product = await this.productRepository.findOne({
      where: {},
      order: { id: 'ASC' },
    });
    const livestock = await this.livestockRepository.findOne({
      where: {},
      order: { id: 'ASC' },
    });
    const doctor = doctors[0];
    if (!product || !livestock || !doctor) {
      return;
    }

    this.logger.log(
      'Seeding addresses, cart, wishlist, an order, and engagement data...',
    );

    await this.addressRepository.save([
      {
        userId: farmer.id,
        label: 'Home',
        contactName: farmer.name || 'Test Farmer',
        phone: farmer.phone || '+8801800000001',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Mirpur',
        postalCode: '1216',
        isDefault: true,
      },
      {
        userId: farmer.id,
        label: 'Farm',
        contactName: farmer.name || 'Test Farmer',
        phone: farmer.phone || '+8801800000001',
        division: 'Dhaka',
        district: 'Savar',
        upazila: 'Savar Sadar',
        postalCode: '1340',
        isDefault: false,
      },
    ]);

    await this.cartItemRepository.save([
      { userId: farmer.id, productId: product.id, quantity: 2 },
    ]);

    await this.wishlistItemRepository.save([
      { userId: farmer.id, livestockId: livestock.id },
    ]);

    const orderId = `GBD-${Date.now().toString(36).toUpperCase()}`;
    const itemPrice = product.price;
    const itemQuantity = 1;
    const subtotal = itemPrice * itemQuantity;
    const tax = Math.round(subtotal * 0.05);
    const shippingFee = 100;
    const netAmount = subtotal + tax + shippingFee;

    await this.orderRepository.save({
      id: orderId,
      userId: farmer.id,
      totalPrice: subtotal,
      tax,
      shippingFee,
      discountAmount: 0,
      netAmount,
      deliveryAddress: {
        label: 'Home',
        contactName: farmer.name || 'Test Farmer',
        phone: farmer.phone || '+8801800000001',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Mirpur',
        postalCode: '1216',
        addressLine: 'Road# 9, house# 5, Lane#3, Mirpur 11/a',
      },
      deliveryMethod: 'standard',
      status: OrderStatus.DELIVERED,
      paymentStatus: 'successful',
    });

    await this.orderItemRepository.save({
      orderId,
      productId: product.id,
      quantity: itemQuantity,
      price: itemPrice,
      discount: product.discount || 0,
      name: product.name,
    });

    await this.transactionRepository.save({
      orderId,
      userId: farmer.id,
      amount: netAmount,
      provider: 'simulate',
      status: PaymentStatus.SUCCESSFUL,
      gatewayTransactionId: `SIM-${orderId}`,
      auditTrail: [{ status: PaymentStatus.SUCCESSFUL, timestamp: new Date() }],
    });

    await this.deliveryRepository.save({
      orderId,
      trackingNumber: `TRK-${orderId}`,
      courierName: 'Gobadi Logistics',
      status: DeliveryStatus.DELIVERED,
      timeline: [
        {
          status: DeliveryStatus.PENDING,
          timestamp: new Date(),
          description: 'Order placed',
        },
        {
          status: DeliveryStatus.DELIVERED,
          timestamp: new Date(),
          description: 'Delivered to customer',
        },
      ],
    });

    await this.reviewRepository.save([
      {
        userId: farmer.id,
        targetType: ReviewTargetType.PRODUCT,
        targetId: String(product.id),
        rating: 5,
        text: 'Worked great for my herd, will buy again.',
        isVerified: true,
      },
      {
        userId: farmer.id,
        targetType: ReviewTargetType.DOCTOR,
        targetId: String(doctor.id),
        rating: 5,
        text: 'Very knowledgeable and responsive, highly recommend.',
        isVerified: true,
      },
    ]);

    await this.notificationRepository.save([
      {
        userId: farmer.id,
        title: 'Order delivered',
        body: `Your order ${orderId} has been delivered.`,
        type: NotificationType.DELIVERY,
        referenceType: 'Order',
        referenceId: orderId,
        isRead: false,
      },
      {
        userId: farmer.id,
        title: 'AI diagnosis ready',
        body: 'Your animal health scan results are ready to view.',
        type: NotificationType.AI_READY,
        isRead: false,
      },
    ]);

    await this.aiDiagnosisRepository.save({
      userId: farmer.id,
      images: [],
      symptoms: ['visual_scan'],
      analysisResult: 'Possible early-stage Foot and Mouth Disease detected',
      confidenceScore: 0.82,
      recommendations: [
        'Quarantine the herd',
        'Contact a veterinarian immediately',
      ],
      recommendedDoctorIds: [doctor.id],
    });
  }
}
