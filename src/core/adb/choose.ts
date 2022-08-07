import { logger } from "../utils/logger";
import { createClient } from "./client";
import { Device } from "./device";
import inquirer from 'inquirer';

export async function chooseDevice(id?: string): Promise<Device | undefined> {
    const adb = await createClient();
    const list = await adb.listDevices();
    if (list.length) {
        const connected_devices = list.filter(d => d.type !== 'offline');
        const choosed_device = connected_devices.find(d => d.id === id);
        if (choosed_device) {
            const device = adb.getDevice(choosed_device.id);
            return device;
        } else {
            logger.info('没有找到指定设备，请选择一个设备：');
            const { device_id } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'device_id',
                    message: '请选择一个设备：',
                    suffix:'（使用方向键选择，回车键确认）',
                    choices: connected_devices.map(d => d.id),
                },
            ]);
            const device = adb.getDevice(device_id);
            return device;
        }
    }
    logger.info('没有发现设备，请连接设备后重试。');
}