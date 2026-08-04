import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { getRequiredJwtSecret } from './jwt-secret.util';
import { RefreshToken } from './refresh-token.entity';

@Global()
@Module({
  imports: [
    UsersModule,
    DoctorsModule,
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.register({
      secret: getRequiredJwtSecret(),
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [JwtModule, UsersModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule { }
