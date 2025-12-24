import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Todo List API')
    .setDescription(
      'A comprehensive Todo list API with user authentication, monthly subscriptions via Paystack, and social engagement features (reactions, comments, shares).',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('subscriptions', 'Subscription and payment management')
    .addTag('todos', 'Todo CRUD operations (requires active subscription)')
    .addTag('users', 'User management')
    .addTag('reactions', 'Reactions on todos (requires active subscription)')
    .addTag('engagements', 'Comments and shares (requires active subscription)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Todo List API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(
    `📚 API Documentation available at: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
