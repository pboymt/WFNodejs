import { createClient } from '@u4/adbkit';
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

server.get<'/screencap', unknown, unknown, unknown, ServerQuery>('/screencap', async (req, res) => {
    if (req.query.device) {
        const stream = await adb.getDevice(req.query.device).screencap();
        const data = await loadDataFromStream(stream);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Length', data.length);
        res.send(data);
    } else {
        res.status(400).send('Missing device');
    }
});

server.listen(3000, () => {
    console.log('Listening on port 3000');
});