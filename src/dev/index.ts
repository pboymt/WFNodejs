import { readdir, watch, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { TARGET_DIR } from '../core/image/target';

const TARGET_LIST_FILE = join(__dirname, '../../src/scripts/_targets.ts');

function debounce(fn: () => void, delay: number) {
    let timer: NodeJS.Timeout | undefined;
    return () => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(fn, delay);
    };
}

export async function watchTargetsAndGenerateTargetInterface(): Promise<void> {
    const debounced = debounce(generateTargetList, 1000);
    debounced();
    const watcher = watch(TARGET_DIR, { recursive: true });
    for await (const _ of watcher) {
        debounced();
    }
}

async function generateTargetList(): Promise<void> {
    const list = await readdir(TARGET_DIR);
    const targets = list.map((filename) => basename(filename, '.png'));
    const content = 'import { Target } from "../core/image/target";\n\n' +
        `export interface LTargets {\n` +
        targets.map(v => `    '${v}': Target;`).join('\n') + '\n' +
        `}\n\n` +
        'export type Targets = keyof LTargets;\n';
    await writeFile(TARGET_LIST_FILE, content);
}
