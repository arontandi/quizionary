import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing auth token');
    }

    try {
      const token = authHeader.split('Bearer ')[1];

      const auth = this.firebaseService.getAuth();
      const decodedToken = await auth.verifyIdToken(token);
      request.user = decodedToken;
      return true;
    } catch (error) {
      console.error("Token verification failed", error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
