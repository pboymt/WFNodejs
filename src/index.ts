import "./core/utils/env";
import { writeFile } from 'node:fs/promises';
import { createClient, Device } from './core/adb';
import { program } from 'commander';
import { join } from 'node:path';
import moment from 'moment';
import { loadDataFromStream } from './core/utils/stream';
import { logger } from "./core/utils/logger";

program
    .name('wfa')
    .version('0.0.1')
    .description('WFNodejs is a tool for Android device to play World Flipper automatically.');

program
    .command('play')
    .action(async () => {
        const adb = createClient();
        const list = await adb.listDevices();
        if (list.length) {
            const chooseNoneOffline = list.find(d => d.type !== 'offline');
            if (chooseNoneOffline) {
                const device = adb.getDevice(chooseNoneOffline.id);
                const stream = await device.screencap();
                const data = await loadDataFromStream(stream);
                await writeFile(join(__dirname, 'screen.png'), data);
            }
        }
    });

interface CShotOptions {
    device?: string;
    saveDir: string;
}

program
    .command('shot')
    .argument('[filename]', 'filename of screenshot', (v, p) => v ?? moment().format('YYYYMMDD-HHmmss'))
    .option('-d, --device <id>', 'device id')
    .option('-s, --save-dir <dir>', 'save directory', join(process.cwd(), 'screenshot'))
    .description('Take a screenshot and save it to a file.')
    .action(async (filename: string | undefined, options: CShotOptions) => {
        const adb = await createClient();
        const list = await adb.listDevices();
        if (list.filter(d => d.type !== 'offline').length === 0) {
            logger.warn('No device connected.');
            return;
        } else {
            try {
                let device: Device;
                if (options.device) {
                    const result = list.find(d => d.id === options.device);
                    if (result) {
                        device = adb.getDevice(result.id);
                    } else {
                        logger.error('Device not found.');
                        return;
                    }
                } else {
                    device = adb.getDevice(list[0].id);
                }
                const filepath = join(options.saveDir, filename ? `${filename}.png` : `${moment().format('YYYYMMDD-HHmmss')}.png`);
                const img = await device.screenshot(false);
                await writeFile(filepath, img);
            } catch (error) {
                logger.error(error);
            }
        }
    });

program.parse();