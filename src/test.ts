import { test } from 'node:test';
import { createClient } from './core/adb/client';
import { Device } from './core/adb/device';

(async () => {

    const adb = createClient();
    const list = await adb.listDevices();
    const { id, type } = list[0];
    const device = adb.getDevice(id);

    console.log(await device.rotation());
    console.log(await device.screenSize());
    console.log(await device.isScreenOn());
    console.log(await device.appCurrent());
    // await t.test('Open screen', async (t) => {
    //     device.shell(['input', 'keyevent', '26']);
    // });

    // await t.test('Get screen size', async (t) => {
    //     const size = await device.screenSize();
    //     t.is(size.width, 1080);
    //     t.is(size.height, 1920);
    // }
})();