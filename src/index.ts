// import cv from '@u4/opencv4nodejs';
import { createClient } from '@u4/adbkit';
import { execSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { loadDataFromStream } from './utils/stream';

async function main() {
    // const img = await cv.imreadAsync('./test.jpg');
    // console.log(img.sizes);
    // await cv.imshowWait('test', img);
    const adb = createClient();
    const list = await adb.listDevices();
    const device = list[0].getClient();
    const stream = await device.screencap();
    const data = await loadDataFromStream(stream);
    await writeFile('./src.jpg', data);
}

main();
