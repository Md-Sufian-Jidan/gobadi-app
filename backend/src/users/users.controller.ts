import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: "Get the current user's own profile" })
  @ApiResponse({ status: 200, description: 'The user profile' })
  async getMe(@CurrentUser() user: JwtPayload): Promise<Omit<User, 'password'>> {
    const found = await this.usersService.findById(user.sub);
    return found as Omit<User, 'password'>;
  }

  @Patch('me')
  @ApiOperation({ summary: "Update the current user's own profile" })
  @ApiResponse({ status: 200, description: 'The updated user profile' })
  async updateMe(
    @Body() body: UpdateProfileDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Omit<User, 'password'>> {
    return this.usersService.updateProfile(user.sub, body);
  }
}
