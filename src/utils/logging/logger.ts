import log from "loglevel";

// Define log levels
// Uncomment below line when Env file is added
// const LOG_LEVEL = process.env.NODE_ENV === "production" ? "warn" : "debug";


const LOG_LEVEL = "debug";

// Configure the logger
log.setLevel(LOG_LEVEL);

const logger = {
  debug: (message: string, ...args: any[]) => log.debug(message, ...args),
  info: (message: string, ...args: any[]) => log.info(message, ...args),
  warn: (message: string, ...args: any[]) => log.warn(message, ...args),
  error: (message: string, ...args: any[]) => log.error(message, ...args),
  capture: (message: string, error?: any) => {
    log.error(`[CRITICAL] ${message}`, error);
  },
};

export default logger;
