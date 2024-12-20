import { Global, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [JwtModule, AuthModule],
  exports: [UserService],
})
export class UserModule {}
