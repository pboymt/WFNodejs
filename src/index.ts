// import cv from '@u4/opencv4nodejs';
import { createClient } from '@u4/adbkit';
import { execSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { Stream, Readable } from 'node:stream';

function getSdkPath() {
    let sdkRoot = process.env.ANDROID_HOME;
    if (!sdkRoot) {
        switch (process.platform) {
            case 'win32':
                sdkRoot = execSync('where.exe adb').toString().trim();
                break;
            case 'darwin':
                sdkRoot = execSync('which adb').toString().trim();
                break;
            case 'linux':
                sdkRoot = execSync('which adb').toString().trim();
                break;
            default:
                throw new Error('ANDROID_HOME is not set');
        }
    }
    return join(dirname(sdkRoot), '..');
}

async function loadDataFromStream(stream: Readable) {
    return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => {
            chunks.push(chunk);
        }).on('end', () => {
            resolve(Buffer.concat(chunks));
        }).on('error', (err: unknown) => {
            reject(err);
        });
    });
}


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
