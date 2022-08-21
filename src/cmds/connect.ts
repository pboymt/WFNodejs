import { Command } from "commander";
import { createClient } from "../core/adb";
import { logger } from "../core/utils/logger";

const cmd = new Command('connect');

cmd
    .description('通过 TCP/IP 连接到 Android 设备。（需要在设备上开启无线调试服务）')
    .argument('<host>', '设备 IP 地址或域名')
    .argument('[port]', '设备调试端口号', (v, p) => typeof v === 'string' ? parseInt(v) : v, 5555)
    .action(async (host: string, port: number) => {
        const adb = await createClient();
        const result = await adb.connect(host, port ?? 5555);
        logger.info(result ? '连接成功' : '连接失败');
    });

export default cmd;