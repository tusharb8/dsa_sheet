import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RIGHTS_KEY } from './rights.decorator';

@Injectable()
export class RightsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(RIGHTS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();
    const userRights: string[] = [];
    for (const role of user?.roles ?? []) {
      for (const right of role?.rights ?? []) {
        if (!userRights.includes(right.name)) {
          userRights.push(right.name);
        }
      }
    }
    return required.some((right) => userRights.includes(right));
  }
}
