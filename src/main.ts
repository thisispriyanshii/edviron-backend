import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_ORIGIN || '',
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Listen on Render-assigned port
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}

bootstrap();
