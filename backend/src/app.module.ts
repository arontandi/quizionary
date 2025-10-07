import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';

@Module({
  imports: [FirebaseModule, AuthModule, QuizzesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
