import Express from 'express';
import { Server } from 'node:net';
import { setTimeout } from 'node:timers/promises';
import { join } from 'path';
import { logger } from './core/utils/logger';

export interface WebUIOptions {
    host: string;
    port: number;
    logport: number;
}

// @Server()
export class WebUI {

    private host: string;
    private port: number;
    private stopped = false;

    private readonly server: Express.Application;
    private runner?: Server;

    constructor({ host, port }: { host: string, port: number }) {
        this.host = host;
        this.port = port;
        this.server = Express();
        this.server.use(Express.static(join(__dirname, '..', 'ui')));
    }

    public async start() {
        this.runner = this.server.listen(this.port, this.host, async () => {
            logger.info(`Web UI 服务已启动，监听地址：${this.host}:${this.port}`);
        });
        // loop
        while (true) {
            await setTimeout(5000);
        }
    }

    public async stop() {
        this.runner?.close();
    }

    private bind() {

    }

}