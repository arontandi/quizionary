import { Controller, Post, UseGuards, UsePipes, ValidationPipe, Body, Request, Get, Param, NotFoundException, UnauthorizedException, Delete, ForbiddenException } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { GradingService } from './grading.service';
import { mapCreateDtoToQuestion } from './mappers/question.mapper';
import { submitAnswersDto } from './dto/submit-answers.dto';

@Controller('quizzes')
@UseGuards(FirebaseAuthGuard)
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService, private readonly grading: GradingService) { }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    async createQuizWithQuestions(@Request() req, @Body() createQuizDto: CreateQuizDto) {
        const questions = createQuizDto.questions.map(mapCreateDtoToQuestion);
        const { quiz } = await this.quizzesService.createQuizWithQuestions(
            {
                title: createQuizDto.title,
                description: createQuizDto.description,
                createdBy: req.user.uid,
                createdAt: new Date().toISOString()
            },
            questions
        );
        return quiz;
    }

    @Get('me')
    async getOwnQuizzes(@Request() req) {
        const uid = req.user?.uid;
        if (!uid) throw new UnauthorizedException('Missing authenticated user.');
        return this.quizzesService.getQuizByUser(uid);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const quiz = await this.quizzesService.getQuizByIdWithQuestions(id);
        if (!quiz) throw new NotFoundException(`Quiz not found`);
        return quiz;
    }

    @Get(':id/attempts')
    async getAttempts(@Param('id') id: string) {
        return this.quizzesService.getAttempts(id);
    }

    @Get(':id/attempts/:attemptId')
    async getAttemptDetail(@Param('id') quizId: string, @Param('attemptId') attemptId: string) {
        const a = await this.quizzesService.getAttempt(quizId, attemptId);
        if (!a) throw new NotFoundException('Attempt not found');
        return a;
    }

    @Post(':id/submit')
    async submit(@Param('id') quizId: string, @Request() req: any, @Body() body: submitAnswersDto) {
        const uid = req.user?.uid;
        const quiz = await this.quizzesService.getQuizByIdWithQuestions(quizId);

        if (!quiz) throw new NotFoundException('Quiz not found');

        const { perQuestion, numCorrect, maxPoints, score } = this.grading.gradeAnswers(quiz?.questions as any[], body.answers);

        const now = new Date().toISOString();
        const total = quiz.questions.length;
        const correct = numCorrect;
        const scorePct = Math.round(score * 100);
        const startedAt = body.startedAt ?? now;
        const completedAt = body.completedAt ?? now;
        const durationSec = Math.max(0, Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000));

        const attemptDetail = {
            userId: uid,
            quizId,
            startedAt,
            completedAt,
            durationSec,
            correct,
            total,
            scorePct,
            answers: body.answers,
            perQuestion,
        } as const;

        const attempt = await this.quizzesService.addAttempt(quizId, attemptDetail);

        return attempt;
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Request() req: any) {
        const uid = req.user?.uid;
        if (!uid) throw new UnauthorizedException('Missing authenticated user.');

        const quiz = await this.quizzesService.getQuizById(id);
        if (!quiz) throw new NotFoundException('Quiz not found.');

        if (quiz.createdBy !== uid) throw new ForbiddenException('You can only delete your own quizzes.');

        await this.quizzesService.deleteQuizCascade(id);
        return { ok: true };
    }

    @Get('me/recent')
    async getRecentQuizzes(@Request() req: any) {
        const uid = req.user?.uid;
        if (!uid) throw new UnauthorizedException('Missing authenticated user.');
        return this.quizzesService.getRecentQuizzesByUser(uid, 5);
    }
}
