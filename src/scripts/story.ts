import { createOption } from "commander";
import { getLogger } from "log4js";
import { setTimeout } from "timers/promises";
import { BaseOptions, BaseScript } from "../core/script";
import { RegisterScript } from "../core/script/register";

const logger = getLogger('single');

interface StoryOptions extends BaseOptions {
    stamina: boolean | number;
    stones: boolean;
    count: number;
}

@RegisterScript({
    name: 'story',
    description: '清理未读剧情',
    options: [
    ]
})
export class StoryScript extends BaseScript {

    package_name = 'com.leiting.wf';

    chara_count = 0;
    story_count = 0;

    constructor(private options: StoryOptions) {
        super(options);
    }

    async init() {
        for (const [key, value] of Object.entries(this.options)) {
            logger.debug(`${key} = ${value}`);
        }
    }

    async play() {
        await this.wait_for_story_list_title();
        while (await this.find_story_chara_new()) {
            const has_chara_new = await this.find_story_chara_new();
            if (has_chara_new) {
                await this.wait_for_chara_story_list();
                while (await this.find_story_new()) {
                    await this.skip_story();
                    await setTimeout(1000);
                    this.story_count++;
                    logger.debug(`已清理剧情 ${this.story_count} 个`);
                }
                await this.back_to_story_list();
                await setTimeout(1000);
                this.chara_count++;
                logger.debug(`已清理角色 ${this.chara_count} 个`);
            } else {
                break;
            }
        }
    }

    @BaseScript.use('story-list-title')
    async wait_for_story_list_title() {
        logger.debug('等候进入剧情列表');
        while (!await this.target('story-list-title').exists()) {
            await setTimeout(2000);
        }
        logger.info('进入剧情列表');
    }

    @BaseScript.use('story-chara-new')
    async find_story_chara_new() {
        logger.debug('寻找未读剧情角色');
        const chara = await this.target('story-chara-new').exists();
        if (chara) {
            logger.info('找到未读剧情角色');
            await this.target('story-chara-new').click();
            return true;
        } else {
            logger.info('未找到未读剧情角色');
            return false;
        }
    }

    @BaseScript.use('story-list-chara')
    async wait_for_chara_story_list() {
        logger.debug('等候进入角色剧情列表');
        while (!await this.target('story-list-chara').exists()) {
            await setTimeout(2000);
        }
        logger.info('进入角色剧情列表');
    }

    @BaseScript.use('story-item-new')
    async find_story_new() {
        logger.debug('寻找未读剧情');
        const chara = await this.target('story-item-new').exists();
        logger.debug(chara);
        if (chara) {
            logger.info('找到未读剧情');
            await this.target('story-item-new').click();
            await setTimeout(1000);
            return true;
        } else {
            logger.info('未找到未读剧情');
            return false;
        }
    }

    @BaseScript.use('story-skip', 'story-skip-ok', 'story-close')
    async skip_story() {
        logger.debug('跳过剧情');
        while (!await this.target('story-skip-ok').exists()) {
            await this.target('story-skip').click();
            await setTimeout(1000);
        }
        logger.info('点击跳过剧情');
        while (!await this.target('story-close').exists()) {
            await this.target('story-skip-ok').click();
            await setTimeout(1000);
        }
        logger.info('点击关闭剧情');
        while (await this.target('story-close').exists()) {
            await this.target('story-close').click();
            await setTimeout(1000);
        }
    }

    @BaseScript.use('story-list-title', 'btn-back')
    async back_to_story_list() {
        logger.debug('返回剧情列表');
        while (!await this.target('story-list-title').exists()) {
            await this.target('btn-back').click();
            await setTimeout(1000);
        }
        logger.info('返回剧情列表');
    }

    async finish() {
        logger.info(`清理剧情完成，共清理角色 ${this.chara_count} 个，剧情 ${this.story_count} 个`);
    }

}