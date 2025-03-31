import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // NestFactory is a class provided by NestJS to create an application instance.
  const app = await NestFactory.create(AppModule);

  // AppModule is the root module of your application, which defines
  // all the other modules, controllers, and services.
  await app.listen(process.env.PORT ?? 3000);
}

// The function bootstrap() is async because it contains asynchronous
//  operations (creating the app and starting the server).
bootstrap();
