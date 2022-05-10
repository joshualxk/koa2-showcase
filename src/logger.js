import winston from 'winston';
import 'winston-daily-rotate-file';

const {combine, timestamp, json} = winston.format;

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'log/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), json()),
  transports: [fileRotateTransport],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
