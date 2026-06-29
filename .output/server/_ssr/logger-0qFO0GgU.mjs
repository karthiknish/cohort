import { x as toISO } from "./utils-hh4sibN0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/logger-0qFO0GgU.js
var logger = class Logger {
	constructor() {}
	static getInstance() {
		if (!Logger.instance) Logger.instance = new Logger();
		return Logger.instance;
	}
	formatMessage(level, message, context) {
		const logObject = {
			timestamp: toISO(),
			level: level.toUpperCase(),
			message,
			...context
		};
		return JSON.stringify(logObject);
	}
	info(message, context) {
		console.log(this.formatMessage("info", message, context));
	}
	warn(message, context) {
		console.warn(this.formatMessage("warn", message, context));
	}
	error(message, error, context) {
		const errorContext = error instanceof Error ? {
			...context,
			error: error.message,
			stack: error.stack
		} : {
			...context,
			error: String(error)
		};
		console.error(this.formatMessage("error", message, errorContext));
	}
	debug(message, context) {}
}.getInstance();
//#endregion
export { logger as t };
