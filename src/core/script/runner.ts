import { Device } from "../adb";
import { BaseOptions, BaseScript } from "./base";

export async function play<T extends BaseOptions>(Script: new (options: T) => BaseScript, options: T): Promise<void> {
    const script = new Script(options);
    await script.load_targets();
    await script.wait_for_app_ready();
    await script.init();
    await script.play();
    await script.finish();
}