import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCHOOL_SCOPED_KEY } from '../decorators/school-scoped.decorator';
import { JwtPayload } from '../../modules/auth/strategies/jwt.strategy';

@Injectable()
export class SchoolGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Always attach schoolId to the request for downstream use
    request.schoolId = user.schoolId;

    // Check if the route is school-scoped (has @SchoolScoped() decorator)
    const isSchoolScoped = this.reflector.getAllAndOverride<boolean>(SCHOOL_SCOPED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isSchoolScoped) {
      const paramSchoolId = request.params.schoolId;
      if (paramSchoolId && paramSchoolId !== user.schoolId) {
        throw new ForbiddenException('You do not have access to this school');
      }
    }

    return true;
  }
}