import { program } from "commander";
import { createClient } from "../core/adb";
import { logger } from "../core/utils/logger";

program
    .argument('<host>', '设备 IP 地址或域名')
    .argument('[port]', '设备调试端口号', (v, p) => typeof v === 'string' ? parseInt(v) : v, 5555)
    .action(async (host: string, port: number) => {
        const adb = await createClient();
        const result = await adb.connect(host, port ?? 5555);
        logger.info(result ? '连接成功' : '连接失败');
    });

program.parse();