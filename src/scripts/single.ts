import { createOption } from "commander";
import { getLogger } from "log4js";
import { setTimeout } from "timers/promises";
import { BaseOptions, BaseScript } from "../core/script";
import { RegisterScript } from "../core/script/register";

const logger = getLogger('single');

interface SingleOptions extends BaseOptions {
    stamina: boolean | number;
    stones: boolean;
    count: number;
}

const STAMINA_TYPES = {
    'l': '体力回复药（大）',
    'm': '体力回复药（中）',
    's': '体力回复药（小）',
    'p': '星导石×50'
}

type STAMINA_TYPE = keyof typeof STAMINA_TYPES;

@RegisterScript({
    name: 'single',
    description: '单人',
    options: [
        createOption('--stamina [times]', '自动回复体力').default(true).argParser((value) => {
            const parsed = parseInt(value);
            if (Number.isNaN(parsed) || parsed < 1) {
                return false;
            } else {
                return parsed;
            }
        }),
        createOption('-0, --no-stamina', '不自动回复体力'),
        createOption('--stones', '使用星导石').default(false),
        createOption('--no-stones', '不使用星导石'),
        createOption('--count [times]', '挑战次数').default(0, '不限次数')
    ]
})
export class SingleScript extends BaseScript {

    package_name = 'com.leiting.wf';

    play_count = 0;
    stamina_count = 0;

    constructor(private options: SingleOptions) {
        super(options);
    }

    async init() {
        for (const [key, value] of Object.entries(this.options)) {
            logger.debug(`${key} = ${value}`);
        }
    }

    async play() {
        while (true) {
            await this.wait_for_room();
            logger.info(`开始第${this.play_count + 1}次战斗`);
            if (!await this.wait_for_battle()) {
                logger.warn(`体力不足，第${this.play_count + 1}次战斗取消`);
                break;
            }
            await this.wait_for_battle_finished();
            await this.wait_for_battle_again();
            this.play_count++;
            logger.info(`完成第${this.play_count}次战斗`);
            if (this.options.count > 0 && this.play_count >= this.options.count) {
                break;
            }
        }
        logger.info(`脚本结束，共完成${this.play_count}次战斗`);
    }

    @BaseScript.use('btn-single-battle-start')
    async wait_for_room() {
        logger.debug('等候进入房间');
        while (!await this.target('btn-single-battle-start').exists()) {
            await setTimeout(2000);
        }
        logger.info('进入房间');
    }

    @BaseScript.use('btn-single-battle-start', 'btn-battle-auto-skill-on', 'label-lack-stamina')
    async wait_for_battle() {
        logger.debug('尝试进入战斗');
        while (!await this.target('btn-battle-auto-skill-on').exists()) {
            if (await this.target('label-lack-stamina').exists()) {
                logger.info('体力不足');
                if (this.options.stamina) {
                    logger.debug('设置为：自动回复体力');
                    if (this.options.stamina === true ||
                        (typeof this.options.stamina === 'number' && this.stamina_count < this.options.stamina)) {
                        const result = await this.add_stamina();
                        if (result) {
                            this.stamina_count++;
                        } else {
                            return false;
                        }
                    } else {
                        logger.info('超过设置的最大回复次数，退出');
                        return false;
                    }
                } else {
                    logger.info('不自动回复体力，退出');
                    return false;
                }
            }
            await this.target('btn-single-battle-start').click();
            await setTimeout(2000);
        }
        logger.info('进入战斗');
        return true;
    }


    @BaseScript.use('btn-stamina-l', 'btn-stamina-m', 'btn-stamina-s',
        'btn-stamina-p', 'btn-use', 'label-stamina-ok', 'btn-ok')
    async add_stamina(high_priority: STAMINA_TYPE = 's') {
        logger.debug('回复体力');
        const priority: STAMINA_TYPE[] = ['s', 'm', 'l', 'p'];
        if (!this.options.stones) {
            priority.splice(priority.indexOf('p'), 1);
        }
        if (high_priority !== 's') {
            priority.splice(priority.indexOf(high_priority), 1);
            priority.unshift(high_priority);
        }
        let result = false;
        let stamina_type: string = 'unknown';
        for (const type of priority) {
            const item = this.target(`btn-stamina-${type}`);
            if (await item.exists()) {
                result = await item.click();
                await setTimeout(2000);
                if (result) {
                    stamina_type = STAMINA_TYPES[type];
                    logger.info(`使用 ${stamina_type}`);
                    break;
                }
            }
        }
        if (!result) {
            logger.warn('无法回复体力');
            return false;
        }
        while (!await this.target('btn-use').exists()) {
            logger.debug('等待使用确认');
            await setTimeout(2000);
        }
        while (!await this.target('label-stamina-ok').exists()) {
            await this.target('btn-use').click();
            await setTimeout(2000);
        }
        logger.info(`${stamina_type} 使用完毕`);
        while (await this.target('label-stamina-ok').exists()) {
            await this.target('btn-ok').click();
            await setTimeout(2000);
        }
        return true;
    }

    @BaseScript.use('btn-continue')
    async wait_for_battle_finished() {
        logger.debug('等待战斗结束');
        while (!await this.target('btn-continue').exists()) {
            await setTimeout(2000);
        }
        logger.info('战斗结束');
    }

    @BaseScript.use('btn-continue', 'btn-battle-again')
    async wait_for_battle_again() {
        logger.debug('通过结算界面');
        while (!await this.target('btn-battle-again').exists()) {
            await this.target('btn-continue').click();
            await setTimeout(2000);
        }
        logger.info('返回房间');
        while (await this.target('btn-battle-again').exists()) {
            await this.target('btn-battle-again').click();
            await setTimeout(2000);
        }
    }



    async finish() {
        logger.debug('finish');
    }
}