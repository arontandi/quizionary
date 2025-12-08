import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard/dashboard.component';
import { QuizGenerateComponent } from './features/quizzes/generate/quiz-generate/quiz-generate.component';
import { QuizTakeComponent } from './features/quizzes/take/quiz-take/quiz-take.component';
import { AdminComponent } from './features/admin/admin/admin.component';
import { canActivateRole } from './core/guards/role.guard';
import { authGuard } from './core/guards/auth.guard';
import { QuizCreateComponent } from './features/quizzes/quiz-create/quiz-create.component';
import { QuizDetailsComponent } from './features/quizzes/details/quiz-details/quiz-details.component';
import { guestGuard } from './core/guards/guest.guard';
import { AttemptViewComponent } from './features/quizzes/attempts/attempt-view/attempt-view.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canMatch: [guestGuard] },
  { path: 'register', component: RegisterComponent, canMatch: [guestGuard] },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'quiz/generate', component: QuizGenerateComponent, canActivate: [authGuard] },
  { path: 'quiz/new', component: QuizCreateComponent, canActivate: [authGuard] },
  { path: 'quiz/:id/take', component: QuizTakeComponent, canActivate: [authGuard] },
  { path: 'quiz/:id', component: QuizDetailsComponent, canActivate: [authGuard] },
  { path: 'quiz/:id/attempts/:attemptId', component: AttemptViewComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [canActivateRole(['Admin'])] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
