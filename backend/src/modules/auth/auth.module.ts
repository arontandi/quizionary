import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Module({
  imports: [FirebaseModule],
  providers: [AuthService, FirebaseAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, FirebaseAuthGuard],
})
export class AuthModule {}
