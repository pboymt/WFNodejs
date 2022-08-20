import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { TARGET_DIR } from "./target";

export async function listTargets(): Promise<string[]> {
    const list = await readdir(TARGET_DIR);
    return list.map(f => basename(f, '.png'));
}
