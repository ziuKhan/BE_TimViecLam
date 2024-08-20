import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY, IS_PUBLIC_PERMISSION } from '../decorator/customize';

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

    const isPublicPermission = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_PERMISSION,
      [context.getHandler(), context.getClass()],
    );

    if (err || !user) {
      throw err || new UnauthorizedException('Token không hợp lệ');
    }

    //Check permission
    const targetMethod = request.method;
    const targetApiPath = request.route?.path as string;
    const permission = user?.permissions ?? [];
    let isExit = permission?.find(
      (permission) =>
        targetMethod === permission.method &&
        targetApiPath === permission.apiPath,
    );

    if (targetApiPath.startsWith('/api/v1/auth')) {
      isExit = true;
    }

    if (!isPublicPermission && !isExit) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    return user;
  }
}
