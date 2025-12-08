import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateUserProfileInput } from './dto/create-user-profile.dto';

@Injectable()
export class UsersService {
    constructor(private firebase: FirebaseService) { }

    async createOrUpdateUserProfile(input: CreateUserProfileInput) {
        const db = this.firebase.getDatabase();
        const ref = db.collection('users').doc(input.uid);

        const snap = await ref.get();

        const data: any = {
            uid: input.uid,
            email: input.email,
            displayName: input.displayName,
        };

        if (!snap.exists) {
            data.createdAt = new Date().toISOString();
        }

        await ref.set(data, { merge: true });
        return { ok: true };
    }

    async deleteUserProfile(uid: string) {
        const db = this.firebase.getDatabase();
        await db.collection('users').doc(uid).delete();
        return { ok: true };
    }
}
