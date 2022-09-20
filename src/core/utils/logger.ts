import npmlog from 'npmlog';
import { configure, getLogger } from 'log4js';
import Env from './env';
import SocketIOAppender from './loggers/io';
import UDPAppender from './loggers/udp';

npmlog.pause();

configure({
    appenders: {
        console: {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '%[[%d{yyyy/MM/dd hh:mm:ss}][%0.1p][%c]%] %m',
            },
        },
        logfile: {
            type: 'file',
            filename: 'wfa.log',
            maxLogSize: 10485760,
            backups: 3,
            compress: true,
            layout: {
                type: 'pattern',
                pattern: '[%d{yyyy-MM-dd hh:mm:ss}][%p][%c] %m',
            },
        },
        udp: {
            type: UDPAppender,
            host: 'localhost',
            port: 5757,
        }
    },
    categories: {
        default: {
            appenders: ['console', 'logfile', 'udp'],
            level: Env.get('LOG_LEVEL', 'info'),
        },
        wfa: {
            appenders: ['console', 'logfile'],
            level: Env.get('LOG_LEVEL', 'info'),
        }
    },
});

export const logger = getLogger('wfa');