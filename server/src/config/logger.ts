import winston from "winston";
import path from "path";
import fs from "fs";
import { env } from "~/config/keys";

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }),
];

// Add file logging only in production
if (env.nodeEnv === "production") {
  const logsDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  );
}

const logger = winston.createLogger({
  defaultMeta: { service: "Bcc007Pay", instance: process.pid },
  level: env.nodeEnv === "development" ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      let msg = `${timestamp} [${level}]: ${message}`;
      if (Object.keys(meta).length) {
        try {
          msg += " " + JSON.stringify(meta);
        } catch (e) {
          msg += " [Circular or Unstringifiable Meta]";
        }
      }
      return msg;
    }),
  ),
  transports,
});

export default logger;
