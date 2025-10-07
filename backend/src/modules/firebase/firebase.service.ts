import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { firebaseConfig } from './firebase.config';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private adminAuth: admin.auth.Auth;
  private db: admin.firestore.Firestore;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (!admin.apps.length) {
      if (!fs.existsSync(firebaseConfig.serviceAccount)) {
        throw new Error(`Firebase config file not found at ${firebaseConfig.serviceAccount}`);
      }

      const serviceAccount = JSON.parse(fs.readFileSync(firebaseConfig.serviceAccount, 'utf-8'));


      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      });

      console.log("Firebase Admin SDK Initialized Successfully!");
    } else {
      console.log("Firebase App already initialized.");
    }

    this.adminAuth = admin.auth();
    this.db = admin.firestore();
  }

  onModuleInit() {
    this.initializeFirebase();
  }

  getDatabase() {
    return this.db;
  }

  getAuth() {
    return this.adminAuth;
  }
}
