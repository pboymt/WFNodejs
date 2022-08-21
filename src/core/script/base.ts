import { setTimeout } from "timers/promises";
import { Targets } from "../../scripts/_targets";
import { Device } from "../adb";
import { Target } from "../image/target";
import { logger } from "../utils/logger";

export type Script = new (options: any) => BaseScript;

export interface BaseOptions {
    device: Device;
}

export abstract class BaseScript {

    abstract package_name: string;
    protected device: Device;
    private map_target = new Map<Targets, Target>();

    constructor(options: { device: Device }) {
        this.device = options.device;
    }

    static use(...args: Targets[]): MethodDecorator {
        return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
            if (!Reflect.hasMetadata('use', target)) {
                Reflect.defineMetadata('use', new Set(), target);
            }
            const use_list: Set<string> = Reflect.getMetadata('use', target);
            for (const arg of args) {
                use_list.add(arg);
            }
        }
    }

    target(name: Targets): Target {
        return this.map_target.get(name)!;
    }

    async load_targets(): Promise<void> {
        const target_list: Set<Targets> = Reflect.getMetadata('use', this);
        logger.debug('加载识图模板');
        for (const filename of target_list) {
            const target = new Target(this.device, filename);
            this.map_target.set(filename, target);
            logger.debug(`已加载识图模板: ${filename}`);
        }
        logger.debug('识图模板加载完成');
    }

    async wait_for_app_ready(): Promise<void> {
        logger.debug('等待应用启动');
        while (true) {
            const current_package = await this.device.appCurrent();
            logger.debug(`当前应用: ${current_package.package_name}`);
            if (current_package.package_name === this.package_name) {
                break;
            }
            await this.device.appStart(this.package_name);
            await setTimeout(2000);
        }
        logger.debug('应用启动完成');
    }

    abstract init(): Promise<void>;

    abstract play(): Promise<void>;

    abstract finish(): Promise<void>;

}