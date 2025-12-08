import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { AiModule } from './modules/ai/ai.module';
import { AiController } from './modules/ai/ai.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './modules/users/users.service';
import { UsersController } from './modules/users/users.controller';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [FirebaseModule, AuthModule, QuizzesModule, AiModule, ConfigModule.forRoot({ isGlobal: true }), UsersModule],
  controllers: [AppController, AiController, UsersController],
  providers: [AppService, UsersService],
})
export class AppModule {}
