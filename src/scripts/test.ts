import { Device } from "../core/adb";
import { BaseScript } from "../core/script";

export class TestScript extends BaseScript {
    package_name = 'com.leiting.wf';
    constructor(options: { device: Device }) {
        super(options);
    }
    init() {
        console.log('init');
    }
}   