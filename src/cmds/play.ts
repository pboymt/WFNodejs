import { Command } from "commander";
import { chooseDevice } from "../core/adb";
import { LoadScripts, play, ScriptList } from "../core/script";
import { logger } from "../core/utils/logger";
import { RingScript } from "../scripts";
import { CShotOptions } from "./shot";

const cmd = new Command('play');

const cmd_play = cmd
    .description('运行指定脚本')
    .option('-l, --list', '列出所有脚本', false)
    .action(async (options: { list: boolean }, command: Command) => {
        if (options.list) {
            logger.info(`脚本列表：`);
            for (const script of ScriptList) {
                logger.info(`  ${script.name} - ${script.description}`);
            }
            return;
        }
        command.outputHelp();
    });

LoadScripts([RingScript]);

for (const script of ScriptList) {
    const sub_command = new Command(script.name)
        .description(script.description)
        .option('-d, --device <device>', '设备 ID 或 ADB 网络地址')
        .action(async (options: Pick<CShotOptions, 'device'>) => {
            const device = await chooseDevice(options.device);
            if (device) {
                await play(script.script, { ...options, device });
            }
        });
    for (const option of script.options) {
        sub_command.addOption(option);
    }
    cmd_play.addCommand(sub_command);
}

export default cmd;