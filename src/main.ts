import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { ExceptionsErrorsFilter } from './utils/exceptions-errors-filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // NestFactory is a class provided by NestJS to create an application instance.
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix((process.env.API_PREFIX ?? 'api') + '/v2'); // Set a global prefix for all routes
  // Swagger setup
  const options = new DocumentBuilder()
    .setTitle('API Documentation') // Set the title of your API
    .setDescription('API description') // Provide a short description
    .setVersion('1.0') // Set the version of your API
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
      },
      'access-token',
    )
    .build(); // Create the document options

  // Generate the Swagger document
  const document = SwaggerModule.createDocument(app, options);
  // Serve the Swagger UI at the '/api' endpoint
  SwaggerModule.setup('api', app, document);

  app.use(morgan('dev')); // Use the Morgan middleware for logging
  // Morgan is a middleware for logging HTTP requests in Node.js applications.

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // ValidationPipe is a built-in pipe in NestJS that validates incoming requests.
  // It uses class-validator and class-transformer libraries to validate and transform the incoming data.
  // The whitelist option removes properties that do not have decorators in the DTO.
  // The forbidNonWhitelisted option throws an error if non-whitelisted properties are found.
  // The transform option automatically transforms the incoming data to the DTO class type.

  app.useGlobalFilters(new ExceptionsErrorsFilter()); // Use a global filter for handling exceptions
  // ExceptionsErrorsFilter is a custom filter that handles exceptions globally.
  // It extends the built-in ExceptionFilter class and overrides the catch method to handle exceptions in a custom way.
  // This filter is used to catch and handle exceptions thrown by the application.
  // It can be used to log errors, send custom error responses, etc.
  // The catch method is called whenever an exception is thrown in the application.
  // The filter can be used to handle specific types of exceptions or all exceptions.

  // AppModule is the root module of your application, which defines
  // all the other modules, controllers, and services.
  await app.listen(process.env.PORT ?? 3000);
}

// The function bootstrap() is async because it contains asynchronous
//  operations (creating the app and starting the server).
bootstrap();
