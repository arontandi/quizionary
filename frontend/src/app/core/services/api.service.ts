import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CreateQuizPayload, Quiz, RecentQuizActivity } from '../models/quiz.models';
import { map, Observable } from 'rxjs';
import { ServerQuizDTO } from '../models/server-dto';
import { mapServerQuizToClient } from '../mappers/quiz.mappers';
import { AttemptDetail, AttemptSummary } from '../models/attempt.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) { }

  createUserProfile(displayName: string) {
    return this.http.post<{ ok: true }>(`${this.base}/users/me`, { displayName });
  }

  deleteMyProfile() {
    return this.http.delete<{ ok: true }>(`${this.base}/users/me`);
  }

  getQuiz(id: string): Observable<Quiz> {
    return this.http.get<ServerQuizDTO>(`${this.base}/quizzes/${id}`).pipe(map(mapServerQuizToClient));
  }

  createQuiz(payload: CreateQuizPayload): Observable<Quiz> {
    return this.http.post<Quiz>(`${this.base}/quizzes`, payload);
  }

  submitAnswers(quizId: string, answers: Record<string, any>, startedAt: string): Observable<AttemptDetail> {
    return this.http.post<AttemptDetail>(`${this.base}/quizzes/${quizId}/submit`, { answers, startedAt });
  }

  getAttempts(quizId: string) {
    return this.http.get<AttemptSummary[]>(`${this.base}/quizzes/${quizId}/attempts`);
  }

  getAttempt(quizId: string, attemptId: string) {
    return this.http.get<AttemptDetail>(`${this.base}/quizzes/${quizId}/attempts/${attemptId}`);
  }

  getMyQuizzes(opts?: { q?: string; sort?: 'createdAt_desc' | 'createdAt_asc' | 'title_asc' | 'title_desc' }): Observable<Quiz[]> {
    let params = new HttpParams();
    if (opts?.q) params = params.set('q', opts.q);
    if (opts?.sort) params = params.set('sort', opts.sort);

    return this.http.get<ServerQuizDTO[]>(`${this.base}/quizzes/me`, { params }).pipe(
      map(list => list.map(mapServerQuizToClient)));
  }

  getMyRecentQuizzes() {
    return this.http.get<RecentQuizActivity[]>(`${this.base}/quizzes/me/recent`);
  }

  deleteQuiz(id: string) {
    return this.http.delete<{ ok: true }>(`${this.base}/quizzes/${id}`);
  }

  generateQuizFromText(text: string) {
    return this.http.post<any>(`${this.base}/ai/generate-quiz-from-text`, { text });
  }

  generateQuizFromPdf(file: File) {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<any>(`${this.base}/ai/generate-quiz-from-pdf`, form);
  }
}
