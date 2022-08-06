import "./core/utils/env";
import { logger } from "./core/utils/logger";
import { program } from 'commander';
import moment from 'moment';
import { readdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { createClient, Device } from './core/adb';
import { play } from "./core/script";
import { TestScript } from "./scripts/test";

program
    .name('wfa')
    .version('0.0.1')
    .description('WFNodejs is a tool for Android device to play World Flipper automatically.');

const cmd_play = program
    .command('play')
    .action(async () => {
        const adb = createClient();
        const list = await adb.listDevices();
        if (list.length) {
            const chooseNoneOffline = list.find(d => d.type !== 'offline');
            if (chooseNoneOffline) {
                const device = adb.getDevice(chooseNoneOffline.id);
                await play(TestScript, { device });
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
    .option('-s, --save-dir <dir>', 'save directory', join(__dirname, '..', 'screenshot'))
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

program
    .command('tpl [template]')
    .description('Take a screenshot and search the specified template.')
    .option('-d, --device <id>', 'device id')
    .action(async (template: string | undefined, options: Pick<CShotOptions, 'device'>) => {
        if (!template) {
            const list = await readdir(join(__dirname, '..', 'target'));
            for (const file of list) {
                if (file.endsWith('.png')) {
                    // remove extension
                    const name = basename(file, '.png');
                    logger.info(name);
                }
            }
            return;
        }else{
            
        }
    });

program.parse();