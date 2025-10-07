import { Controller, Post, UseGuards, UsePipes, ValidationPipe, Body, Request } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';

@Controller('quizzes')
@UseGuards(FirebaseAuthGuard)
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) {}

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    async createQuizWithQuestions(@Request() req, @Body() createQuizDto: CreateQuizDto) {
        return this.quizzesService.createQuizWithQuestions(
            { 
                title: createQuizDto.title,
                description: createQuizDto.description, 
                createdBy: req.user.uid, 
                createdAt: new Date().toISOString() 
            },
            createQuizDto.questions
        );
    }
}
