import { config } from 'dotenv';
import { join } from 'node:path';

config({
    path: join(__dirname, '../../../.env')
});

export default class Env {
    static get(key: string): string | undefined;
    static get(key: string, default_value: string): string;
    static get(key: string, default_value?: string): string | undefined {
        return process.env[key] ?? default_value;
    }
}
