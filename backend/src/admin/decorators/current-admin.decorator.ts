import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AdminJwtPayload {
  sub: number;
  role: AdminRole;
  type: 'admin';
}

import { AdminRole } from '../entities/admin.entity';

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AdminJwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.admin;
  },
);
