import { DeviceClient } from "@u4/adbkit";
import { imdecodeAsync, Mat } from "@u4/opencv4nodejs";
import { setTimeout } from "node:timers/promises";
import { logger } from "../utils/logger";
import { loadDataFromStream } from "../utils/stream";

const DISPLAY_REGEXP = /DisplayViewport\{.*valid=true, .*orientation=(?<orientation>\d+), .*deviceWidth=(?<width>\d+), .*deviceHeight=(?<height>\d+)/;

export class Device extends DeviceClient {

    private last_screenshot_buf?: Buffer;
    private last_screenshot_time: number = 0;
    private is_capturing = false;

    async screenshot(mat?: true): Promise<Mat>;
    async screenshot(mat?: false): Promise<Buffer>;
    async screenshot(mat = true): Promise<Buffer | Mat> {
        logger.trace(`输出截图格式：${mat ? 'Mat' : 'Buffer'}`);
        let data: Buffer;
        if (this.is_capturing) {
            if (Date.now() - this.last_screenshot_time < 1000 && this.last_screenshot_buf !== undefined) {
                data = this.last_screenshot_buf;
            } else {
                while (this.is_capturing) {
                    await setTimeout(100);
                }
                data = this.last_screenshot_buf!;
            }
        } else {
            if (Date.now() - this.last_screenshot_time < 1000 && this.last_screenshot_buf !== undefined) {
                data = this.last_screenshot_buf;
            } else {
                data = await this.capture_proc();
            }
        }
        if (mat) {
            return await imdecodeAsync(data);
        }
        return data;
    }

    private async capture_proc() {
        this.is_capturing = true;
        const stream = await this.screencap();
        const data = await loadDataFromStream(stream);
        this.is_capturing = false;
        this.last_screenshot_time = Date.now();
        this.last_screenshot_buf = data;
        return data;
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
        let dumpsys = await this.execOut(['dumpsys', 'window'], 'utf-8');
        let m_current = /mCurrentFocus=Window\{.*\s+(?<package>[^\s]+)\/(?<activity>[^\s]+)\}/.exec(dumpsys);
        if (m_current) {
            return {
                package_name: m_current.groups?.package ?? '',
                activity: m_current.groups?.activity ?? ''
            };
        }
        dumpsys = await this.execOut(['dumpsys', 'activity', 'activities'], 'utf-8');
        m_current = /mResumedActivity: ActivityRecord\{.*?\s+(?<package>[^\s]+)\/(?<activity>[^\s]+)\s.*?\}/.exec(dumpsys);
        let package_name: string = '';
        if (m_current) {
            package_name = m_current.groups?.package ?? '';
        }
        dumpsys = await this.execOut(['dumpsys', 'activity', 'top'], 'utf-8');
        const m_current_array = dumpsys.matchAll(/ACTIVITY (?<package>[^\s]+)\/(?<activity>[^/\s]+) \w+ pid=(?<pid>\d+)/g);
        for (const m of m_current_array) {
            if (m.groups?.package === package_name) {
                return {
                    package_name,
                    activity: m.groups?.activity ?? ''
                };
            }
        }
        return {
            package_name,
            activity: ''
        }
    }

    async toggleScreen(): Promise<void> {
        await this.execOut([`input`, `keyevent`, `26`]);
    }

    toString() {
        return `[Device: ${this.serial}]`;
    }

}