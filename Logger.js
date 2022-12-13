const {createLogger, transports, format} = require('winston');
const {combine, timestamp, printf, prettyPrint } = format;

const {sysConfig} = require('./config');

let Logger;

if(sysConfig.NODE_ENV === 'development')
{
    const logFormat = printf(({level, message, timestamp}) => {
        return `${timestamp} ${level}: ${message}`;
    }) 

    Logger = createLogger({
        level:sysConfig.LOGGINGLEVEL,
        transports: [
            new transports.Console({level:sysConfig.LOGGINGLEVEL, handleExceptions: sysConfig.HANDLE_UNEXPECTED_EXCEPTIONS_IN_LOGGER}),
        ],
        format: combine(
                format.colorize(),
                timestamp({format:'YYYY-MM-DD HH:MM:SS'}),
                logFormat
        ),
        
    })

}else{

    Logger = createLogger({
        level:sysConfig.LOGGINGLEVEL,
        transports: [
            new transports.File({filename: 'logs/combined.log',handleExceptions:true}),
            new transports.File({filename:'logs/errors.log',level:'error',handleExceptions:true}),
            new transports.File({filename:'logs/warnings.log',level:'warn',handleExceptions:true})
        ],
        format: format.json()
    })
}


module.exports = Logger;