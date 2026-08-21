import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

export class JwtGuard extends AuthGuard('jwt'){
    constructor(private readonly reflector: Reflector){
        super()
    }
    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY ,[context.getHandler(),context.getClass()])
         
        if(isPublic) return true
        return super.canActivate(context);
    }
    
}
