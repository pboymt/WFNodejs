import "./core/utils/env";
import 'reflect-metadata';
import { logger } from "./core/utils/logger";
import { Command, program } from 'commander';
import moment from 'moment';
import { readdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { createClient, Device } from './core/adb';
import { LoadScripts, play, ScriptList } from "./core/script";
import { TestScript } from "./scripts/ring";
import { chooseDevice } from "./core/adb/choose";
import { listTargets } from "./core/image/list";
import { Target } from "./core/image/target";
import { watchTargetsAndGenerateTargetInterface } from "./dev";
import { test } from "./test";

interface CShotOptions {
    device?: string;
    saveDir: string;
}

program
    .name('wfa')
    .version('0.0.1')
    .description('WFNodejs 是一个运行于 Node.js 的游戏自动化脚本，目前可用于世界弹射物语（国服）。');

const cmd_play = program
    .command('play')
    .description('运行指定脚本')
    .option('-l, --list', '列出所有脚本', false)
    .action(async (options: { list: boolean }, command: Command) => {
        if (options.list) {
            console.log(`脚本列表：`);
            for (const script of ScriptList) {
                console.log(`  ${script.name} - ${script.description}`);
            }
            return;
        }
        command.outputHelp();
    });

LoadScripts([TestScript]);

for (const script of ScriptList) {
    const sub_command = new Command(script.name)
        .description(script.description)
        .option('-d, --device <device>', '设备 ID 或 ADB 网络地址')
        .action(async (options: Pick<CShotOptions, 'device'>) => {
            const device = await chooseDevice(options.device);
            if (device) {
                await play(script.script, { device });
            }
        });
    cmd_play.addCommand(sub_command);
}

program
    .command('shot')
    .argument('[filename]', 'filename of screenshot', (v, p) => v ?? moment().format('YYYYMMDD-HHmmss'))
    .option('-d, --device <id>', 'device id')
    .option('-s, --save-dir <dir>', 'save directory', join(__dirname, '..', 'screenshot'))
    .description('（开发用）从选定的设备上截图并保存到本地')
    .action(async (filename: string | undefined, options: CShotOptions) => {
        try {
            const device = await chooseDevice(options.device);
            if (device) {
                const filepath = join(options.saveDir, filename ? `${filename}.png` : `${moment().format('YYYYMMDD-HHmmss')}.png`);
                const img = await device.screenshot(false);
                await writeFile(filepath, img);
            }
        } catch (error) {
            logger.error(error);
        }
    });

program
    .command('connect')
    .argument('<host>', '设备 IP 地址或域名')
    .argument('[port]', '设备调试端口号', (v, p) => typeof v === 'string' ? parseInt(v) : v, 5555)
    .description('通过 TCP/IP 连接到 Android 设备。（需要在设备上开启无线调试服务）')
    .action(async (host: string, port: number) => {
        const adb = await createClient();
        const result = await adb.connect(host, port ?? 5555);
        logger.info(result ? '连接成功' : '连接失败');
    });

const cmd_dev = program
    .command('dev')
    .description('一些开发用指令，不要在正式环境使用');

cmd_dev
    .command('test')
    .description('测试指令')
    .action(async () => {
        await test();
    });

const cmd_dev_template = cmd_dev
    .command('template')
    .description('图片模板的开发指令');

cmd_dev_template
    .command('list')
    .description('列出所有模板')
    .action(async () => {
        const list = await listTargets();
        for (const file of list) {
            if (file.endsWith('.png')) {
                // remove extension
                const name = basename(file, '.png');
                logger.info(name);
            }
        }
    });

cmd_dev_template
    .command('find <name>')
    .description('在选定设备的当前屏幕画面中查找指定模板')
    .option('-d, --device <id>', '设备 ID')
    .action(async (name: string, options: Pick<CShotOptions, 'device'>) => {
        const list = await listTargets();
        if (!list.includes(name)) {
            logger.error(`模板 ${name} 不存在`);
            return;
        }
        const device = await chooseDevice(options.device);
        if (!device) return;
        const result = await new Target(device, `${name}.png`).find();
        if (result) {
            logger.info(`找到 ${name}，位置：${result.x}, ${result.y}`);
        } else {
            logger.info(`未找到 ${name}`);
        }
    });

cmd_dev_template
    .command('watch')
    .description('生成所有模板')
    .action(async () => {
        await watchTargetsAndGenerateTargetInterface();
    });

program.parse();