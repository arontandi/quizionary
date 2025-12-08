import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthService {
    constructor(private fireBaseService: FirebaseService) { }

    async verifyToken(authorizationHeader: string) {
        // try {
        //     const auth = this.fireBaseService.getAuth();
        //     const decodedToken = await auth.verifyIdToken(token);
        //     return { uid: decodedToken.uid, email: decodedToken.email };
        // } catch (error) {
        //     throw new UnauthorizedException('Invalid or expired token');
        // }

        if (!authorizationHeader) throw new UnauthorizedException('Missing Authorization header');

        const token = authorizationHeader.startsWith('Bearer ')
            ? authorizationHeader.slice(7)
            : authorizationHeader;

        try {
            const auth = this.fireBaseService.getAuth();
            const decodedToken = await auth.verifyIdToken(token);

            return {
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name ?? decodedToken['displayName'] ?? null,
            }
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }

    }
}
