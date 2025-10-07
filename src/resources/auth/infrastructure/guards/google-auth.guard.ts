import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { env } from '../../../../@config/envs/env.config';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
