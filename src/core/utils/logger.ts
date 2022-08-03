import npmlog from 'npmlog';
import { configure, getLogger } from 'log4js';

npmlog.pause();

configure({
    appenders: {
        console: {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '%[%d{yyyy-MM-dd HH:mm:ss} %p %c -%] %m',
            },
        },
    },
    categories: {
        default: {
            appenders: ['console'],
            level: 'info',
        },
    },
});

export const logger = getLogger('main');