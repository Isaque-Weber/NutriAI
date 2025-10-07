import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { log } from '../logging/logger';
import { SentryExceptionCaptured } from '@sentry/nestjs';

@Catch()
export class GlobalExceptionsHandler implements ExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    log.error(
      `[${request.method}] ${request.url} >> StatusCode: ${status} >> ${exception.message} ${JSON.stringify(exception)}`,
    );

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : (exception.message ?? 'Internal server error');

    const errorCode = exception.name ?? 'INTERNAL_SERVER_ERROR';

    const responseJson: any = {
      statusCode: status,
      errorCode,
      message:
        typeof message === 'string'
          ? message
          : ((message as any)?.message ?? message),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(responseJson);
  }
}
