import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorator/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (err || !user) {
      throw err || new UnauthorizedException('Token không hợp lệ');
    }

    //Check permission
    const targetMethod = request.method;
    const targetApiPath = request.route?.path;

    const permission = user?.permissions?.find(
      (permission) =>
        targetMethod === permission.method &&
        targetApiPath === permission.apiPath,
    );

    if (!Boolean(permission) || !permission) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }
      return user;
   
  }
}
