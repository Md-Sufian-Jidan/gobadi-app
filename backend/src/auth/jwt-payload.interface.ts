import { UserRole } from '../users/user.entity';

export interface JwtPayload {
  sub: number;
  role: UserRole;
  phone: string;
}
