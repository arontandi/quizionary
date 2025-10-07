import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Quiz } from 'src/shared/quizzes.schema';
import { Question } from 'src/shared/questions.schema';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class QuizzesService {
    private db: FirebaseFirestore.Firestore;
    constructor(private firebaseService: FirebaseService) {
        this.db = this.firebaseService.getDatabase();
    }

    async createQuizWithQuestions(quizData: Quiz, questions: Question[]): Promise<{quiz: Quiz, questions: Question[]}> {
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
        return { quiz, questions};
    }

    /*
    async getQuizById(quizId: string): Promise<Quiz | null> {
        const quizRef = this.db.collection('quizzes').doc(quizId);
        const doc = await quizRef.get();
        return doc.exists ? (doc.data() as Quiz) : null;
    }*/
}
