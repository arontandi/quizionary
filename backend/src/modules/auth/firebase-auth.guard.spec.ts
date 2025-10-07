import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';

describe('FirebaseAuthGuard', () => {
  it('should be defined', () => {
    const firebaseService = new FirebaseService(); // Use the real FirebaseService
    expect(new FirebaseAuthGuard(firebaseService)).toBeDefined();
  });
});
