import { Client, DeviceClient } from "@u4/adbkit";
import { loadDataFromStream } from "../utils/stream";

const DISPLAY_REGEXP = /DisplayViewport\{.*valid=true, .*orientation=(?<orientation>\d+), .*deviceWidth=(?<width>\d+), .*deviceHeight=(?<height>\d+)/;

export class Device extends DeviceClient {

    async screenshot(): Promise<Buffer> {
        const stream = await this.screencap();
        return await loadDataFromStream(stream);
    }

    async keyevent(keyCode: number): Promise<void> {
        await this.execOut([`input`, `keyevent`, `${keyCode}`]);
    }

    async click(x: number, y: number): Promise<void> {
        await this.execOut([`input`, `tap`, `${x}`, `${y}`]);
    }

    async swipe(startX: number, startY: number, endX: number, endY: number, duration: number): Promise<void> {
        await this.execOut([`input`, `swipe`, `${startX}`, `${startY}`, `${endX}`, `${endY}`, `${duration}`]);
    }

    async text(text: string): Promise<void> {
        await this.execOut([`input`, `text`, text]);
    }

    async packageInfo(package_name: string): Promise<object> {
        const dumpsys = await this.execOut(['dumpsys', 'package', package_name], 'utf-8');
        const m_version_name = /versionName=(?<version_name>[^\s]+)/.exec(dumpsys);
        const version_name = m_version_name?.groups?.version_name ?? '';
        const m_version_code = /versionCode=(?<version_code>[^\d]+)/.exec(dumpsys);
        const version_code = m_version_code?.groups?.version_code ?? '';
        return {
            package_name,
            version_name,
            version_code
        };
    }

    async rotation(): Promise<number> {
        const dumpsys = await this.execOut(['dumpsys', 'display'], 'utf-8');
        const m_orientation = dumpsys.match(DISPLAY_REGEXP);
        return parseInt(m_orientation?.groups?.orientation ?? '-1');
    }

    async screenSize(): Promise<{ width: number, height: number }> {
        const dumpsys = await this.execOut(['dumpsys', 'display'], 'utf-8');
        const m_size = dumpsys.match(DISPLAY_REGEXP);
        return {
            width: parseInt(m_size?.groups?.width ?? '-1'),
            height: parseInt(m_size?.groups?.height ?? '-1')
        };
    }

    async appStart(package_name: string, activity?: string): Promise<void> {
        if (activity) {
            await this.execOut([`am`, `start`, `-n`, `${package_name}/${activity}`]);
        } else {
            await this.execOut(['monkey', '-p', package_name, '-c', 'android.intent.category.LAUNCHER', '1']);
        }
    }

    async appStop(package_name: string): Promise<void> {
        await this.execOut([`am`, `force-stop`, package_name]);
    }

    async appClear(package_name: string): Promise<void> {
        await this.execOut([`pm`, `clear`, package_name]);
    }

    async isScreenOn(): Promise<boolean> {
        const dumpsys = await this.execOut(['dumpsys', 'power'], 'utf-8');
        return /mHoldingDisplaySuspendBlocker=true/.test(dumpsys);
    }

    async appCurrent(): Promise<{ package_name: string, activity: string }> {
        const dumpsys = await this.execOut(['dumpsys', 'window'], 'utf-8');
        const m_current = /mCurrentFocus=Window\{.*\s+(?<package>[^\s]+)\/(?<activity>[^\s]+)\}/.exec(dumpsys);
        const package_name = m_current?.groups?.package ?? '';
        const activity = m_current?.groups?.activity ?? '';
        return {
            package_name,
            activity
        }
    }

}