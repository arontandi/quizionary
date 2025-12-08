import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
  imports: [QuizzesModule, FirebaseModule]
})
export class AiModule {}
