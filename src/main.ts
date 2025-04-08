import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MorganMiddleware } from './middlewares/morgan-middleware';

async function bootstrap() {
  // NestFactory is a class provided by NestJS to create an application instance.
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix((process.env.API_PREFIX ?? 'api') + '/v1'); // Set a global prefix for all routes
  // Swagger setup
  const options = new DocumentBuilder()
    .setTitle('API Documentation') // Set the title of your API
    .setDescription('API description') // Provide a short description
    .setVersion('1.0') // Set the version of your API
    .build(); // Create the document options

  // Generate the Swagger document
  const document = SwaggerModule.createDocument(app, options);
  // Serve the Swagger UI at the '/api' endpoint
  SwaggerModule.setup('api', app, document);

  app.use(MorganMiddleware); // Use the Morgan middleware for logging
  // Morgan is a middleware for logging HTTP requests in Node.js applications.

  // AppModule is the root module of your application, which defines
  // all the other modules, controllers, and services.
  await app.listen(process.env.PORT ?? 3000);
}

// The function bootstrap() is async because it contains asynchronous
//  operations (creating the app and starting the server).
bootstrap();
