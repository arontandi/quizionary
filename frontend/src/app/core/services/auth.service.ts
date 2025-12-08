import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { deleteUser, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { BehaviorSubject, map, Observable, shareReplay } from 'rxjs';

export type Role = 'Admin' | 'User' | 'Visitor';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable().pipe(shareReplay(1));
  isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(map(u => !!u));

  private initializedSubject = new BehaviorSubject<boolean>(false);
  initialized$ = this.initializedSubject.asObservable();

  constructor(private auth: Auth) {
    this.auth.onAuthStateChanged(user => {
      this.currentUserSubject.next(user);
      this.initializedSubject.next(true);
    });
  }

  async register(email: string, password: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(cred.user, { displayName });

    return cred;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  async getIdToken(): Promise<string | null> {
    const immediate = this.auth.currentUser;
    if (immediate) return immediate.getIdToken();

    const user = await new Promise<User | null>(resolve => {
      onAuthStateChanged(this.auth, u => resolve(u), () => resolve(null));
    });
    return user ? user.getIdToken() : null;
  }

  async role(): Promise<Role> {
    const user = this.currentUserSubject.value;
    if (!user) return 'Visitor';
    const tokenResult = await user.getIdTokenResult();
    return (tokenResult.claims['role'] as Role) ?? 'User';
  }

  async updateDisplayName(displayName: string): Promise<void> {
    const user = this.currentUserSubject.value;
    if (!user) {
      throw new Error('Not authenticated');
    }

    await updateProfile(user, { displayName });

    await user.reload();
    this.currentUserSubject.next(this.auth.currentUser);
  }

  async deleteAccount(): Promise<void> {
    const user = this.currentUserSubject.value;
    if (!user) {
      throw new Error('Not authenticated');
    }

    await deleteUser(user);
    this.currentUserSubject.next(null);
  }
}
