const winston = require('winston');
const { combine, timestamp, prettyPrint } = winston.format;
const moment = require('moment');
require('winston-daily-rotate-file');

const createTransport = ({ level, customFileName, ...others }) => {
    return new winston.transports.DailyRotateFile({
        filename: `logs/${moment().format('YYYY-MM-DD')}/${customFileName || level}-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        prepend: true,
        level: level,
        maxDays: 0,
        maxSize: '10m',
        ...others
    });
};

const combinedLog = createTransport({ customFileName: 'trace', handleExceptions: true });
const errorLog = createTransport({ level: 'error', handleExceptions: true });

const logger = winston.createLogger({
    format: combine(
        timestamp(),
        prettyPrint()
    ),
    transports: [
        new winston.transports.Console({ handleExceptions: true, level: process.env.NODE_ENV === "production" ? 'warn' : undefined }),
        combinedLog,
        errorLog
    ]
});

const endTime = function () {
    const currentTime = new Date(), { startTime, endTime, timeout, level, ...others } = this;
    let effectiveTimeout = timeout || 1000;
    let totalTimeTaken = currentTime - startTime;
    if (totalTimeTaken > effectiveTimeout) {
        others.totalTimeTaken = totalTimeTaken;
        logger[level || "info"](others);
    }
}

logger.startTime = function (args) {
    if (typeof args === 'string') {
        args = { source: args };
    }
    if (!args) {
        args = {};
    }
    return { startTime: new Date(), ...args, endTime };
}


module.exports = logger;