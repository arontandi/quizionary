import { Module } from '@nestjs/common';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { GradingService } from './grading.service';

@Module({
  imports: [FirebaseModule],
  controllers: [QuizzesController],
  providers: [QuizzesService, GradingService],
  exports: [QuizzesService]
})
export class QuizzesModule {}
