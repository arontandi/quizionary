import { Injectable, NotFoundException } from '@nestjs/common';
import { Quiz } from 'src/shared/quizzes.schema';
import { Question } from 'src/shared/questions.schema';
import { FirebaseService } from '../firebase/firebase.service';
import { AttemptDetailDto, AttemptSummaryDto } from './dto/attempt-summary.dto';

@Injectable()
export class QuizzesService {
    private db: FirebaseFirestore.Firestore;
    constructor(private firebaseService: FirebaseService) {
        this.db = this.firebaseService.getDatabase();
    }

    async createQuizWithQuestions(quizData: Quiz, questions: Question[]): Promise<{ quiz: Quiz, questions: Question[] }> {
        const quizRef = this.db.collection('quizzes').doc();
        const quiz = { ...quizData, id: quizRef.id, createdAt: new Date().toISOString() };

        const batch = this.db.batch();
        batch.set(quizRef, quiz);

        const questionsRef = quizRef.collection('questions');

        questions.forEach((q) => {
            const questionRef = questionsRef.doc();
            const question = { ...q, id: questionRef.id, quizId: quiz.id };
            batch.set(questionRef, question);
        });

        await batch.commit();
        return { quiz, questions };
    }

    async getQuizByIdWithQuestions(quizId: string): Promise<(Quiz & { questions: Question[] }) | null> {
        if (!quizId) return null;

        const quizRef = this.db.collection('quizzes').doc(quizId);
        const quizSnap = await quizRef.get();
        if (!quizSnap.exists) return null;

        const quiz = quizSnap.data() as Quiz;

        const questionSnap = await quizRef.collection('questions').get();
        const questions: Question[] = questionSnap.docs.map(doc => doc.data() as Question);

        return { ...quiz, questions }
    }

    async getQuizById(quizId: string): Promise<Quiz | null> {
        const quizRef = this.db.collection('quizzes').doc(quizId);
        const doc = await quizRef.get();
        return doc.exists ? (doc.data() as Quiz) : null;
    }

    async getAttempts(quizId: string) {
        const quizRef = this.db.collection('quizzes').doc(quizId);
        const snap = await quizRef.collection('attempts').orderBy('completedAt', 'asc').get();
        return snap.docs.map(d => {
            const a = d.data() as AttemptDetailDto;
            const { id, quizId, startedAt, completedAt, durationSec, scorePct, correct, total } = a;
            return { id, quizId, startedAt, completedAt, durationSec, scorePct, correct, total };
        });
    }

    async getAttempt(quizId: string, attemptId: string): Promise<AttemptDetailDto | null> {
        const ref = this.db.collection('quizzes').doc(quizId).collection('attempts').doc(attemptId);
        const doc = await ref.get();
        return doc.exists ? (doc.data() as AttemptDetailDto) : null;
    }

    async addAttempt(quizId: string, attempt: Omit<AttemptDetailDto, 'id' | 'quizId'>): Promise<AttemptDetailDto> {
        const ref = this.db.collection('quizzes').doc(quizId).collection('attempts').doc();
        const payload: AttemptDetailDto = { id: ref.id, quizId, ...attempt };
        await ref.set(payload);
        return payload;
    }

    async getQuizByUser(userId: string): Promise<Quiz[]> {
        const snap = await this.db.collection('quizzes').where('createdBy', '==', userId).get();
        return snap.docs.map(d => {
            const data = d.data() as any;
            const createdAt =
                data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt;

            return { ...data, id: data.id ?? d.id, createdAt } as Quiz;
        });
    }

    async getRecentQuizzesByUser(userId: string, limit = 5) {
        const quizzes = await this.getQuizByUser(userId);

        const results: {
            quizId: string;
            title: string;
            lastAttemptCompletedAt: string;
            scorePct: number | null;
            correct: number | null;
            total: number | null;
        }[] = [];

        for (const quiz of quizzes) {
            if (!quiz.id) continue;

            const quizRef = this.db.collection('quizzes').doc(quiz.id);
            const attemptsSnap = await quizRef
                .collection('attempts')
                .orderBy('completedAt', 'desc')
                .limit(1)
                .get();

            if (attemptsSnap.empty) {
                continue;
            }

            const a = attemptsSnap.docs[0].data() as AttemptDetailDto;

            results.push({
                quizId: quiz.id,
                title: quiz.title,
                lastAttemptCompletedAt: a.completedAt,
                scorePct: a.scorePct ?? null,
                correct: a.correct ?? null,
                total: a.total ?? null,
            });
        }

        results.sort(
            (a, b) =>
                new Date(b.lastAttemptCompletedAt).getTime() -
                new Date(a.lastAttemptCompletedAt).getTime()
        );

        return results.slice(0, limit);
    }

    private async deleteSubCollection(quizRef: FirebaseFirestore.DocumentReference, subPath: 'questions' | 'attempts', batchSize = 250) {
        while (true) {
            const snap = await quizRef.collection(subPath).limit(batchSize).get();
            if (snap.empty) break;

            const batch = this.db.batch();

            snap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();

            if (snap.size < batchSize) break;
        }
    }

    async deleteQuizCascade(quizId: string) {
        const quizRef = this.db.collection('quizzes').doc(quizId);
        const doc = await quizRef.get();
        if (!doc.exists) throw new NotFoundException('Quiz not found');

        await this.deleteSubCollection(quizRef, 'questions');
        await this.deleteSubCollection(quizRef, 'attempts');

        await quizRef.delete();
    }
}
