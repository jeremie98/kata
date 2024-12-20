import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { HashModule } from './hash/hash.module';
import { PrismaModule } from '@kata/prisma';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [JwtModule.register({}), HashModule, PrismaModule],
  exports: [AuthService],
})
export class AuthModule {}
