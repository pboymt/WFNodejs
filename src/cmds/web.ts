import { Command } from "commander";
import { createClient } from "../core/adb";
import { logger } from "../core/utils/logger";
import { WebUI } from "../web";

const cmd = new Command('web');

cmd
    .description('开启 Web UI 控制服务')
    .argument('[host]', '监听地址', '0.0.0.0')
    .argument('[port]', '监听端口', (v, p) => typeof v === 'string' ? parseInt(v) : v, 5000)
    .action(async (host: string, port: number) => {
        await new WebUI({ host, port }).start();
    });

export default cmd;