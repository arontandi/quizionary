import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { storage } from 'firebase-admin';
import { memoryStorage } from 'multer';

@Controller('ai')
@UseGuards(FirebaseAuthGuard)
export class AiController {
    constructor(private readonly ai: AiService) { }

    @Post('generate-quiz-from-text')
    async fromText(@Request() req, @Body() body: { text: string }) {
        if (!req.user?.uid) throw new Error('Missing authenticated user.');
        return this.ai.generateAndCreate(req.user.uid, body.text);
    }

    @Post('generate-quiz-from-pdf')
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(),
        limits: { fileSize: 15 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (file.mimetype !== 'application/pdf') return cb(new Error('Only PDFs are allowed'), false);
            cb(null, true);
        }
    }))
    async fromPdf(@Request() req, @UploadedFile() file: Express.Multer.File) {
        if (!req.user?.uid) throw new Error('Missing authenticated user.');
        return this.ai.generateAndCreateFromPdf(req.user.uid, file);
    }
}
