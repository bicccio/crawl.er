import winston from "winston";
const { combine, colorize } = winston.format;

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: "error",
      format: winston.format.json()
    }),
    new winston.transports.Console({
      level: "info",
      format: combine(colorize(), winston.format.simple())
    }),
    new winston.transports.Console({
      level: "warn",
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
