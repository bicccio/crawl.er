import winston from "winston";

const { combine, colorize } = winston.format;
import fs from "fs";
import path from "path";

const logDir = "log";

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const filename = path.join(logDir, "results.log");

const logger = winston.createLogger({
  format: combine(colorize(), winston.format.simple()),
  level: "debug",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: filename,
      options: { encoding: "utf8" },
      format: winston.format.printf(info => `${info.message}`)
    })
  ]
});

module.exports = logger;
