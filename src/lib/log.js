import winston from "winston";

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: "error",
      format: winston.format.json()
    }),
    new winston.transports.Console({
      level: "info",
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
