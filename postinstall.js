const dotenv = require('dotenv');
const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const fs = require('node:fs');
const { writeFile } = require('node:fs/promises');
const { join, resolve } = require('node:path');
const path = require('node:path');
const package = require('./package.json');

dotenv.config();

const keys = ['disableAutoBuild', 'opencvIncludeDir', 'opencvLibDir', 'opencvBinDir'];

console.log('Checking OpenCV...');

function checkPackageJson() {
    if (package.opencv4nodejs) {
        const section = package.opencv4nodejs;
        for (const key of keys) {
            if (key === 'disableAutoBuild') {
                if (typeof section[key] === 'number') {
                    if (section[key] !== 1) {
                        break;
                    }
                    process.env.OPENCV4NODEJS_DISABLE_AUTOBUILD = '1';
                } else {
                    break;
                }
            } else {
                if (typeof section[key] !== 'string') {
                    break;
                }
                try {
                    const stat = fs.statSync(section[key]);
                    if (!stat.isDirectory()) {
                        throw new Error(`${key} is not a directory: ${section[key]}`);
                    } else {
                        switch (key) {
                            case 'opencvIncludeDir':
                                process.env.OPENCV_INCLUDE_DIR = resolve(section[key]);
                                break;
                            case 'opencvLibDir':
                                process.env.OPENCV_LIB_DIR = resolve(section[key]);
                                break;
                            case 'opencvBinDir':
                                process.env.OPENCV_BIN_DIR = resolve(section[key]);
                                break;
                        }
                    }
                } catch (error) {
                    throw new Error(`${key} is not a directory: ${section[key]}`);
                }
            }
        }
    }
}

if (process.env.OPENCV4NODEJS_DISABLE_AUTOBUILD === '1') {
    if (process.env.OPENCV_INCLUDE_DIR && process.env.OPENCV_LIB_DIR && process.env.OPENCV_BIN_DIR) {
        console.log('发现环境变量中的 OpenCV 目录，不需要单独构建');
    } else {
        console.log('环境变量 OPENCV4NODEJS_DISABLE_AUTOBUILD 被设置为 1，但环境变量中的 OPENCV_INCLUDE_DIR、OPENCV_LIB_DIR、OPENCV_BIN_DIR 不存在，将自动构建 OpenCV');
        process.env.OPENCV4NODEJS_DISABLE_AUTOBUILD = '0';
    }
}

(async () => {

    try {

        if (existsSync('node_modules/@u4/opencv4nodejs/build/Release/opencv4nodejs.node')) {
            console.log('opencv4nodejs.node 已被编译过，不需要重新编译');
            process.exit(0);
        }

        const npm_cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

        const cp = spawnSync(npm_cmd, ['exec', 'build-opencv', 'rebuild'], {
            stdio: 'inherit', env: process.env
        });

        if (cp.status !== 0) {
            throw new Error('OpenCV 构建失败');
        }

        console.log('OpenCV 构建成功');

    } catch (error) {

        console.error(error);
        process.exit(1);

    }

})();

