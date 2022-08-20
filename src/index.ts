import "./core/utils/env";
import 'reflect-metadata';
import { logger } from "./core/utils/logger";
import { Command, program } from 'commander';
import moment from 'moment';
import { readdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { createClient, Device } from './core/adb';
import { LoadScripts, play, ScriptList } from "./core/script";
import { TestScript } from "./scripts/ring";
import { chooseDevice } from "./core/adb/choose";
import { listTargets } from "./core/image/list";
import { Target } from "./core/image/target";
import { watchTargetsAndGenerateTargetInterface } from "./dev";
import { test } from "./test";

interface CShotOptions {
    device?: string;
    saveDir: string;
}

program
    .name('wfa')
    .version('0.0.1')
    .description('WFNodejs 是一个运行于 Node.js 的游戏自动化脚本，目前可用于世界弹射物语（国服）。')
    .command('shot', '（开发用）从选定的设备上截图并保存到本地')
    .command('play', '运行指定脚本')
    .command('connect', '通过 TCP/IP 连接到 Android 设备。（需要在设备上开启无线调试服务）')
    .command('dev', '一些开发用指令，不要在正式环境使用');

program.parse();