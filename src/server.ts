import { createClient, DeviceClient } from '@u4/adbkit';
import Express from 'express';
import { loadDataFromStream } from './utils/stream';

const adb = createClient();
const server = Express();

server.use(Express.static('./html'));

server.get('/devices', async (req, res) => {
    res.send(await adb.listDevices());
});

interface ServerQuery {
    device?: string;
}

interface ScreenProperties {
    width: number;
    height: number;
    orientation: number;
    density: number;
}

server.get<'/screencap', unknown, unknown, unknown, ServerQuery>('/screencap', async (req, res) => {
    let device: DeviceClient | undefined;
    if (req.query.device) {
        device = adb.getDevice(req.query.device);
    } else {
        const list = await adb.listDevices();
        if (list.length) {
            const chooseNoneOffline = list.find(d => d.type !== 'offline');
            if (chooseNoneOffline) {
                device = adb.getDevice(chooseNoneOffline.id);
            }
        }
    }
    if (device) {
        const stream = await device.screencap();
        const data = await loadDataFromStream(stream);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Length', data.length);
        res.send(data);
    } else {
        res.status(400).send('Missing device');
    }
});

const REGEXP_ORIENTATION = /mCurRotation=(?<orientation>\d+)/;
const REGEXP_SCREEN_SIZE = /Physical size: (?<width>\d+)x(?<height>\d+)/;
const REGEXP_SCREEN_DENSITY = /Physical density: (?<density>\d+)/;

async function screen(device: DeviceClient): Promise<ScreenProperties> {
    const dumpsys = await device.execOut('dumpsys window displays', 'utf-8');
    const m_orientation = REGEXP_ORIENTATION.exec(dumpsys);
    let orientation = -1;
    if (m_orientation && m_orientation.groups && m_orientation.groups.orientation) {
        orientation = parseInt(m_orientation.groups.orientation);
    }
    const wm_size = await device.execOut('wm size', 'utf-8');
    const m_screen_size = REGEXP_SCREEN_SIZE.exec(wm_size);
    let width = -1;
    let height = -1;
    if (m_screen_size && m_screen_size.groups && m_screen_size.groups.width && m_screen_size.groups.height) {
        width = parseInt(m_screen_size.groups.width);
        height = parseInt(m_screen_size.groups.height);
    }
    const wm_density = await device.execOut('wm density', 'utf-8');
    const m_screen_density = REGEXP_SCREEN_DENSITY.exec(wm_density);
    let density = -1;
    if (m_screen_density && m_screen_density.groups && m_screen_density.groups.density) {
        density = parseInt(m_screen_density.groups.density);
    }
    return { width, height, orientation, density };
}

server.get<'/properties', unknown, unknown, unknown, ServerQuery>('/properties', async (req, res) => {
    let device: DeviceClient | undefined;
    if (req.query.device) {
        device = adb.getDevice(req.query.device);
    } else {
        const list = await adb.listDevices();
        if (list.length) {
            const chooseNoneOffline = list.find(d => d.type !== 'offline');
            if (chooseNoneOffline) {
                device = adb.getDevice(chooseNoneOffline.id);
            }
        }
    }
    if (device) {
        res.send(await screen(device));
    } else {
        res.status(400).send('Missing device');
    }
});

server.listen(3000, () => {
    console.log('Listening on port 3000');
});