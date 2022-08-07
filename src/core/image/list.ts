import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";

const TARGET_DIR = join(__dirname, '../../../target');

export async function listTargets(): Promise<string[]> {
    const list = await readdir(join(__dirname, '..', 'target'));
    return list.map(f => basename(f, '.png'));
}