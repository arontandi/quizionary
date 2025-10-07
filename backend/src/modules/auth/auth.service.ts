import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { emitWarning } from 'process';

@Injectable()
export class AuthService {
    constructor(private fireBaseService: FirebaseService) {}

    async verifyToken(token: string) {
        try {
            const auth = this.fireBaseService.getAuth();
            const decodedToken = await auth.verifyIdToken(token);
            return { uid: decodedToken.uid, email: decodedToken.email };
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
