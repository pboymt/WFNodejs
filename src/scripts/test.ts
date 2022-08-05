import { getLogger } from "log4js";
import { setTimeout } from "node:timers/promises";
import { Device } from "../core/adb";
import { BaseScript } from "../core/script";

const logger = getLogger('test');
type TargetList = 'ring' | 'btn-ok' | 'btn-ring-join-accept' | 'waiting-room-team-form' |
    'waiting-room-auto-continue-no' | 'waiting-room-ready-no' | 'battle-auto-skill-on' |
    'finish-alert-team-dismiss' | 'home-btn-chapter' | 'finish-alert-lost-connection';

export class TestScript extends BaseScript<TargetList> {

    script_name = 'test';
    package_name = 'com.leiting.wf';

    target_list = new Set<TargetList>([
        'ring', 'btn-ok', 'btn-ring-join-accept', 'waiting-room-team-form',
        'waiting-room-auto-continue-no', 'waiting-room-ready-no', 'battle-auto-skill-on',
        'finish-alert-team-dismiss', 'home-btn-chapter', 'finish-alert-lost-connection'
    ]);

    constructor(options: { device: Device }) {
        super(options);
    }

    async init() {
        logger.debug('init');
    }

    async play() {
        logger.debug('play');
        // 整个大循环
        while (true) {
            // 等待铃铛
            await this.wait_for_ring();
            // 打开铃铛窗口
            await this.open_ring_window();
            while (true) {
                // 接受铃铛
                await this.accept_ring();
                // 开启自动续战
                await this.enable_auto_continue();
                // 点击准备完毕
                await this.set_ready();
                // 等待战斗
                if (!await this.wait_for_battle()) {
                    break;
                }
                // 等待战斗结束
                await this.wait_for_battle_finish();
                // 等待返回铃铛队伍
                if (!await this.wait_for_return_to_ring_team()) {
                    break;
                }
            }
        }
    }

    async wait_for_ring(): Promise<void> {
        logger.info('等待铃铛');
        while (!await this.target('ring').exists()) {
            await setTimeout(1000);
        }
        logger.info('发现铃铛');
    }

    async open_ring_window(): Promise<void> {
        logger.debug('尝试打开铃铛窗口');
        while (!await this.target('btn-ring-join-accept').exists()) {
            await this.target('ring').click();
            await setTimeout(1500);
        }
        logger.info('打开铃铛窗口');
    }

    async accept_ring(): Promise<void> {
        logger.debug('尝试接受铃铛');
        while (!await this.target('waiting-room-team-form').exists()) {
            await this.target('btn-ring-join-accept').click();
            await setTimeout(1500);
        }
        logger.info('接受铃铛组队');
    }

    async enable_auto_continue(): Promise<void> {
        logger.debug('尝试开启自动续战');
        while (await this.target('waiting-room-auto-continue-no').exists()) {
            await this.target('waiting-room-auto-continue-no').click();
            await setTimeout(1500);
        }
        logger.info('开启自动续战');
    }

    async set_ready(): Promise<void> {
        logger.debug('尝试点击准备完毕');
        while (await this.target('waiting-room-ready-no').exists()) {
            await this.target('waiting-room-ready-no').click();
            await setTimeout(1500);
        }
        logger.info('点击准备完毕');
    }

    async wait_for_battle(): Promise<boolean> {
        logger.info('等待战斗');
        while (!await this.target('battle-auto-skill-on').exists()) {
            if (await this.target('finish-alert-team-dismiss').exists()) {
                while (await this.target('btn-ok').exists()) {
                    await this.target('btn-ok').click();
                    await setTimeout(500);
                }
                return false;
            }
            if (await this.target('home-btn-chapter').exists()) {
                logger.info('队伍被解散');
                return false;
            }
            await setTimeout(5000);
        }
        logger.info('战斗开始');
        return true;
    }

    async wait_for_battle_finish(): Promise<void> {
        logger.debug('等待战斗结束');
        while (await this.target('battle-auto-skill-on').exists()) {
            await setTimeout(5000);
        }
        logger.info('战斗结束');
    }

    async wait_for_return_to_ring_team(): Promise<boolean> {
        // TODO 有时候会出现战斗结束后探测不到队伍解散和网络丢失的情况，需要进一步调试
        // TODO 有时候会出现战斗结束后直接返回主页的情况，这时候需要重新等待铃铛
        logger.info('等待返回铃铛队伍');
        while (!await this.target('waiting-room-team-form').exists()) {
            logger.debug('等待返回铃铛队伍');
            if (await this.target('finish-alert-team-dismiss').exists() || await this.target('finish-alert-lost-connection').exists()) {
                logger.info('队伍被解散');
                while (await this.target('btn-ok').exists()) {
                    logger.debug('尝试点击 OK');
                    await this.target('btn-ok').click();
                    await setTimeout(500);
                }
                return false;
            }
            await setTimeout(2000);
        }
        logger.info('返回铃铛队伍');
        return true;
    }

    async finish() {
        logger.debug('finish');
    }

}   