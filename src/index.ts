// import cv from '@u4/opencv4nodejs';
import { writeFile } from 'node:fs/promises';
import { createClient, Device } from './core/adb';
import { program } from 'commander';
import { join } from 'node:path';
import moment from 'moment';

program
    .name('wfa')
    .version('0.0.1')
    .description('WFNodejs is a tool for Android device to play World Flipper automatically.');

interface CShotOptions {
    device?: string;
    saveDir: string;
}

program
    .command('shot [filename]')
    .option('-d, --device <id>', 'device id')
    .option('-s, --save-dir <dir>', 'save directory', join(process.cwd(), 'screenshot'))
    .description('Take a screenshot and save it to a file.')
    .action(async (filename: string | undefined, options: CShotOptions) => {
        const adb = await createClient();
        const list = await adb.listDevices();
        if (list.filter(d => d.type === 'device').length === 0) {
            console.error('No device connected.');
            return;
        } else {
            try {
                let device: Device;
                if (options.device) {
                    const result = list.find(d => d.id === options.device);
                    if (result) {
                        device = adb.getDevice(result.id);
                    } else {
                        console.error('Device not found.');
                        return;
                    }
                } else {
                    device = adb.getDevice(list[0].id);
                }
                const filepath = join(options.saveDir, filename ? `${filename}.png` : `${moment().format('YYYYMMDD-HHmmss')}.png`);
                const img = await device.screenshot();
                await writeFile(filepath, img);
            } catch (error) {
                console.error(error);
            }
        }
    });

program.parse();