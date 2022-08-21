import { program } from 'commander';
import './core/utils/logger';
import 'reflect-metadata';
import { CmdConnect, CmdDev, CmdPlay, CmdShot } from "./cmds";
import "./core/utils/env";

program
    .name('wfa')
    .version(require('../package.json').version ?? 'unknown')
    .description('WFNodejs 是一个运行于 Node.js 的游戏自动化脚本，目前可用于世界弹射物语（国服）。')
    .addCommand(CmdConnect)
    .addCommand(CmdDev)
    .addCommand(CmdPlay)
    .addCommand(CmdShot);

program.parse();