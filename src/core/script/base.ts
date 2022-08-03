import { setTimeout } from "timers/promises";
import { Device } from "../adb";
import { logger } from "../utils/logger";

export abstract class BaseScript {

    abstract package_name: string;
    private device: Device;

    constructor(options: { device: Device }) {
        this.device = options.device;
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

    abstract init(): void;

}