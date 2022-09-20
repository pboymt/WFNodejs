import { AppenderFunction, AppenderModule, LayoutsParam, Levels, Config, Layout, LayoutFunction, LoggingEvent } from 'log4js';
import SocketIO from 'socket.io-client';

interface SocketIOAppenderOptions {
    url: string;
    env?: string;
    name?: string;
    event?: string;
}

function socketIOAppenderBuilder(config: SocketIOAppenderOptions, layout?: LayoutFunction): AppenderFunction {
    const { url, env = 'dev', name = 'log4js', event = 'log4js' } = config;
    if (!url || !url.length) {
        throw new Error('url is required');
    }

    const socket = SocketIO(url);

    // socket.on('connect_error', err => console.log(`log4js socket.io ${err.message}`));
    // socket.on('connect_timeout', err => console.log('log4js socket.io connect timeout'));
    // socket.on('connect', () => console.log('log4js socket.io connected'));
    // socket.on('disconnect', () => console.log('log4js socket.io disconnected'));
    // socket.on('reconnect', () => console.log('log4js socket.io reconnected'));
    // socket.on('reconnecting', () => console.log('log4js socket.io reconnecting'));

    socket.on('error', err => console.log(err));

    function SocketIOAppender(loggingEvent: LoggingEvent) {
        const message = {
            data: loggingEvent.data,
            level: loggingEvent.level,
            category: loggingEvent.categoryName,
        };
        if (socket.connected) {
            socket.emit(event, message);
        }
    };

    SocketIOAppender.shutdown = (cb: () => void) => {
        socket.close();
        cb();
    };

    return SocketIOAppender;

}

function configure(
    config: SocketIOAppenderOptions,
    layouts?: LayoutsParam,
    findAppender?: (() => AppenderFunction),
    levels?: Levels
): AppenderFunction {
    let layout = layouts?.messagePassThroughLayout;
    return socketIOAppenderBuilder(config, layout);
}

const SocketIOAppender: AppenderModule = {
    configure
};

export default SocketIOAppender;