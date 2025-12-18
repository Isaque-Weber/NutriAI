import pino, { LogFn } from 'pino';
import { logs, SeverityNumber, AnyValueMap } from '@opentelemetry/api-logs';

const otel = logs.getLogger('app');

const numToSeverity: Record<number, SeverityNumber> = {
  10: SeverityNumber.TRACE,
  20: SeverityNumber.DEBUG,
  30: SeverityNumber.INFO,
  40: SeverityNumber.WARN,
  50: SeverityNumber.ERROR,
  60: SeverityNumber.FATAL,
};

export const log = pino({
  level: 'debug',
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-MM-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      },
    ],
  },
  hooks: {
    logMethod(args, method, level) {
      method.apply(this, args as Parameters<LogFn>);
      const [msg, attrs] = args as [
        string | Record<string, unknown>,
        Record<string, unknown>?,
      ];
      otel.emit({
        severityNumber: numToSeverity[level] ?? SeverityNumber.INFO,
        severityText: (pino.levels.labels[level] ?? 'info').toUpperCase(),
        body: typeof msg === 'string' ? msg : JSON.stringify(msg),
        attributes: (attrs ?? {}) as AnyValueMap,
      });
    },
  },
});
