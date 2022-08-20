import { Command, program } from "commander";
import { basename } from "node:path";
import { logger } from "../core/utils/logger";
import { chooseDevice } from "../core/adb";
import { listTargets } from "../core/image/list";
import { Target } from "../core/image/target";
import { watchTargetsAndGenerateTargetInterface } from "../dev";
import { CShotOptions } from "./shot";

// program.action(async (command: Command) => {
//     command.outputHelp();
// });

program
    .command('test')
    .description('测试指令')
    .action(async () => {
        logger.debug('暂时没有什么用');
    });

const program_template = program
    .command('template')
    .description('图片模板的开发指令');

program_template
    .command('list')
    .description('列出所有模板')
    .action(async () => {
        const list = await listTargets();
        for (const file of list) {
            logger.info(file);
        }
    });

program_template
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
        const result = await new Target(device, name).find();
        if (result.x >= 0 && result.y >= 0) {
            logger.info(`找到 ${name}，位置：${result.x}, ${result.y}`);
        } else {
            logger.info(`未找到 ${name}`);
        }
    });

program_template
    .command('watch')
    .description('生成所有模板')
    .action(async () => {
        await watchTargetsAndGenerateTargetInterface();
    });

program.parse();