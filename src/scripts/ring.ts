import { createOption, Option } from "commander";
import { getLogger } from "log4js";
import { setTimeout } from "node:timers/promises";
import { Device } from "../core/adb";
import { BaseOptions, BaseScript } from "../core/script";
import { RegisterScript } from "../core/script/register";
import { LTargets, Targets } from "./_targets";

const logger = getLogger('ring');

interface TestOptions extends BaseOptions {
    stamina: boolean;
}

@RegisterScript({
    name: 'ring',
    description: '铃铛',
    options: [
        createOption('--stamina', '计算耗时').default(true),
        createOption('-0, --no-stamina', '白嫖模式，不开启自动续战')
    ]
})
export class RingScript extends BaseScript {

    package_name = 'com.leiting.wf';

    constructor(private options: TestOptions) {
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
                if (!await this.accept_ring()) {
                    break;
                }
                // 开启自动续战
                if (this.options.stamina) {
                    await this.enable_auto_continue();
                } else {
                    await this.disable_auto_continue();
                }
                // 点击准备完毕
                await this.set_ready();
                // 等待战斗
                if (!await this.wait_for_battle()) {
                    break;
                }
                // 等待战斗结束
                if (!await this.wait_for_battle_finish()) {
                    // break;
                }
                if (this.options.stamina) {
                    // 等待返回铃铛队伍
                    if (!await this.wait_for_return_to_ring_team()) {
                        break;
                    }
                } else {
                    await this.wait_for_return_home();
                }
            }
        }
    }

    @BaseScript.use('ring')
    async wait_for_ring(): Promise<void> {
        logger.info('等待铃铛');
        while (!await this.target('ring').exists()) {
            await setTimeout(1000);
        }
        logger.info('发现铃铛');
    }

    @BaseScript.use('ring', 'btn-ring-join-accept')
    async open_ring_window(): Promise<void> {
        logger.debug('尝试打开铃铛窗口');
        while (!await this.target('btn-ring-join-accept').exists()) {
            await this.target('ring').click();
            await setTimeout(2500);
        }
        logger.info('打开铃铛窗口');
    }

    @BaseScript.use('waiting-room-team-form', 'btn-ring-join-accept', 'btn-ok')
    async accept_ring(): Promise<boolean> {
        logger.debug('尝试接受铃铛');
        while (!await this.target('waiting-room-team-form').exists()) {
            if (await this.target('btn-ok').exists() || await this.target('home-btn-chapter').exists()) {
                logger.info('无法接受铃铛，可能已经解散或开始');
                await this.target('btn-ok').click();
                return false;
            }
            await this.target('btn-ring-join-accept').click();
            await setTimeout(2500);
        }
        logger.info('接受铃铛组队');
        return true;
    }

    @BaseScript.use('waiting-room-auto-continue-no')
    async enable_auto_continue(): Promise<void> {
        logger.debug('尝试开启自动续战');
        while (await this.target('waiting-room-auto-continue-no').exists()) {
            await this.target('waiting-room-auto-continue-no').click();
            await setTimeout(1500);
        }
        logger.info('开启自动续战');
    }

    @BaseScript.use('waiting-room-auto-continue-yes')
    async disable_auto_continue(): Promise<void> {
        logger.debug('尝试关闭自动续战');
        while (await this.target('waiting-room-auto-continue-yes').exists()) {
            await this.target('waiting-room-auto-continue-yes').click();
            await setTimeout(1500);
        }
        logger.info('关闭自动续战');
    }

    @BaseScript.use('waiting-room-ready-no')
    async set_ready(): Promise<void> {
        logger.debug('尝试点击准备完毕');
        while (await this.target('waiting-room-ready-no').exists()) {
            await this.target('waiting-room-ready-no').click();
            await setTimeout(1500);
        }
        logger.info('点击准备完毕');
    }

    @BaseScript.use('btn-battle-auto-skill-on', 'btn-ok', 'home-btn-chapter')
    async wait_for_battle(): Promise<boolean> {
        logger.info('等待战斗');
        while (!await this.target('btn-battle-auto-skill-on').exists()) {
            if (await this.target('btn-ok').exists()) {
                logger.info('无法返回队伍');
                await this.target('btn-ok').click();
                return false;
            }
            if (await this.target('home-btn-chapter').exists()) {
                logger.info('无法返回队伍');
                return false;
            }
            await setTimeout(5000);
        }
        logger.info('战斗开始');
        return true;
    }

    @BaseScript.use('btn-battle-auto-skill-on', 'buyback')
    async wait_for_battle_finish(): Promise<boolean> {
        logger.debug('等待战斗结束');
        while (await this.target('btn-battle-auto-skill-on').exists()) {
            if (await this.target('buyback').exists()) {
                logger.info('战斗失败，不再续战，但有可能战斗胜利');
                return false;
            }
            await setTimeout(5000);
        }
        logger.info('战斗结束');
        return true;
    }

    @BaseScript.use('waiting-room-team-form', 'btn-ok', 'home-btn-chapter')
    async wait_for_return_to_ring_team(): Promise<boolean> {
        logger.info('等待返回铃铛队伍');
        while (!await this.target('waiting-room-team-form').exists()) {
            if (await this.target('btn-ok').exists()) {
                logger.info('队伍被解散，需要关闭对话框');
                await this.target('btn-ok').click();
                return false;
            }
            if (await this.target('home-btn-chapter').exists()) {
                logger.info('队伍被解散，已回到游戏主页');
                return false;
            }
            await setTimeout(2000);
        }
        logger.info('返回铃铛队伍');
        return true;
    }

    @BaseScript.use('btn-leave-room', 'home-btn-chapter', 'btn-continue', 'btn-ok')
    async wait_for_return_home(): Promise<boolean> {
        logger.info('等待返回主页');
        while (!await this.target('home-btn-chapter').exists()) {
            if (await this.target('btn-leave-room').click()) continue;
            if (await this.target('btn-continue').click()) continue;
            if (await this.target('btn-ok').click()) continue;
            await setTimeout(1500);
        }
        logger.info('返回主页');
        return true;
    }

    async finish() {
        logger.debug('finish');
    }

}   