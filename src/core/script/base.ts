import { getLogger, Logger } from "log4js";
import { setTimeout } from "timers/promises";
import { Device } from "../adb";
import { Target } from "../image/target";
import { logger } from "../utils/logger";

export abstract class BaseScript<L extends string> {

    abstract script_name: string;
    abstract package_name: string;
    abstract target_list: Set<L>;
    private device: Device;
    private map_target = new Map<L, Target>();

    constructor(options: { device: Device }) {
        this.device = options.device;
    }

    target(name: L): Target {
        return this.map_target.get(name)!;
    }

    async load_targets(): Promise<void> {
        logger.debug('load_targets');
        for (const filename of this.target_list) {
            const target = new Target(this.device, filename);
            this.map_target.set(filename, target);
        }
        logger.debug('load_targets done');
    }

    async wait_for_app_ready(): Promise<void> {
        logger.debug('wait_for_app_ready');
        while (true) {
            const current_package = await this.device.appCurrent();
            if (current_package.package_name === this.package_name) {
                break;
            }
            await this.device.appStart(this.package_name);
            await setTimeout(2000);
        }
        logger.debug('wait_for_app_ready done');
    }

    abstract init(): Promise<void>;

    abstract play(): Promise<void>;

    abstract finish(): Promise<void>;

}