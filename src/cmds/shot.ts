import { program } from "commander";
import { writeFile } from "fs/promises";
import moment from "moment";
import { join } from "path";
import { chooseDevice } from "../core/adb/choose";
import { logger } from "../core/utils/logger";

export interface CShotOptions {
    device?: string;
    saveDir: string;
}

program
    .argument('[filename]', 'filename of screenshot', (v, p) => v ?? moment().format('YYYYMMDD-HHmmss'))
    .option('-d, --device <id>', 'device id')
    .option('-s, --save-dir <dir>', 'save directory', join(__dirname, '..', 'screenshot'))
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

program.parse();