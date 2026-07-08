import { toISO } from './dates';
import { logError, logWarning } from './convex-errors';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';
interface LogContext {
    [key: string]: unknown;
}
const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
class Logger {
    private static instance: Logger;
    private constructor() { }
    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
        const timestamp = toISO();
        const logObject = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...context,
        };
        return JSON.stringify(logObject);
    }
    info(message: string, context?: LogContext) {
        console.log(this.formatMessage('info', message, context));
    }
    warn(message: string, context?: LogContext) {
        logWarning(message, context);
    }
    error(message: string, error?: unknown, context?: LogContext) {
        const resolvedError = error instanceof Error
            ? error
            : typeof error === 'string'
                ? new Error(error)
                : new Error(message);
        const resolvedContext = error instanceof Error || typeof error === 'string' || error === undefined
            ? context
            : { ...context, ...(error as LogContext) };
        logError(resolvedError, resolvedContext);
    }
    debug(message: string, context?: LogContext) {
        if (!isProduction) {
            console.debug(this.formatMessage('debug', message, context));
        }
    }
}
export const logger = Logger.getInstance();
