import { Option } from "commander";
import { Device } from "../adb";
import { logger } from "../utils/logger";
import { BaseScript, Script } from "./base";

export interface RegisterScriptOptions {
    name: string;
    description: string;
    options: Option[];
}

export interface ScriptInfo extends RegisterScriptOptions {
    script: Script;
}

export const ScriptList = new Set<ScriptInfo>();

export function LoadScripts(scripts: Script[]) {
    logger.debug('注册脚本元数据加载完毕');
}

export function RegisterScript(options: RegisterScriptOptions): ClassDecorator {
    return function (target: Function) {
        if (target.prototype instanceof BaseScript && target !== BaseScript) {
            logger.debug(`注册脚本：${options.name}`);
            ScriptList.add({
                name: options.name,
                description: options.description,
                options: options.options,
                script: target as new (options: unknown) => BaseScript
            });
        }
    }
}