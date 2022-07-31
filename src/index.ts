// import cv from '@u4/opencv4nodejs';
import { createClient } from '@u4/adbkit';
import { writeFile } from 'node:fs/promises';
import { Device } from './core/adb/device';

async function main() {
    // const img = await cv.imreadAsync('./test.jpg');
    // console.log(img.sizes);
    // await cv.imshowWait('test', img);
    const adb = createClient();
    const list = await adb.listDevices();
    const { id, type } = list[0];
    const device = new Device(adb, id);
    const data = await device.screenshot();
    // const data = await loadDataFromStream(stream);
    await writeFile('./src.jpg', data);
}

main();
