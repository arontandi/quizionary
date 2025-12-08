import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://quizionary-d3373.web.app',
      'https://quizionary.web.app',
      'https://quizionary-d3373.firebaseapp.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  });

  const port = Number(process.env.PORT) || 5055;
  const host = process.env.HOST || '127.0.0.1';
  await app.listen(port);
}
bootstrap().catch((err) => {
  console.error('Fatal error during Nest bootstrap', err);
  process.exit(1);
});