import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express'; // <== Add this

@Catch()
export class ExceptionsErrorsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionsErrorsFilter.name);
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Something went wrong';

    // Log the exception
    this.logger.error(`Status: ${status} Error: ${JSON.stringify(message)}`);
    response.status(status).json({
      status: 'error',
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
