import { AdbOptions, Client as ADBClient, ClientOptions } from "@u4/adbkit";
import { Device } from "./device";

export class Client extends ADBClient {
    getDevice(serial: string): Device {
        return new Device(this, serial);
    }
}

export function createClient(options: AdbOptions = { port: 5037 }): Client {
    const opts: ClientOptions = {
        bin: options.bin,
        host: options.host || process.env.ADB_HOST,
        port: options.port || 5037,
    };
    if (!opts.port) {
        const port = parseInt(process.env.ADB_PORT || '5037', 10);
        if (!isNaN(port)) {
            opts.port = port;
        }
    }
    return new Client(opts);
}