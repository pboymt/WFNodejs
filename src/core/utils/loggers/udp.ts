import { LayoutsParam, AppenderFunction, Levels, AppenderModule, LayoutFunction, LoggingEvent } from "log4js";
import { createSocket } from "node:dgram";
import { isIP } from "node:net";

interface UDPAppenderOptions {
    host: string;
    port: number;
    name?: string;
    event?: string;
}

function udpAppenderBuilder(config: UDPAppenderOptions, layout?: LayoutFunction): AppenderFunction {
    const { host, port = 5757, name = 'log4js', event = 'log4js' } = config;


    if (!host || !host.length) {
        throw new Error('host is required');
    }

    const socket = createSocket(isIP(host) === 6 ? 'udp6' : 'udp4');

    return function (loggingEvent: LoggingEvent) {
        const message = {
            data: loggingEvent.data,
            level: loggingEvent.level,
            category: loggingEvent.categoryName,
        };
        socket.send(JSON.stringify(message), port, host);
    };
}

function configure(
    config: UDPAppenderOptions,
    layouts?: LayoutsParam,
    findAppender?: (() => AppenderFunction),
    levels?: Levels
): AppenderFunction {
    let layout = layouts?.messagePassThroughLayout;
    return udpAppenderBuilder(config, layout);
}

const UDPAppender: AppenderModule = {
    configure
};

export default UDPAppender;