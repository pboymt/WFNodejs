const https = require('node:https');
const fs = require('node:fs');
const { writeFile } = require('node:fs/promises');
const path = require('node:path');
const { spawnSync, spawn } = require('node:child_process');

async function checkPlatform() {
    const platform = process.platform;
    if (platform !== 'win32') {
        console.log(`不支持预下载 OpenCV 的平台：${platform}`);
        return false;
    }
    return true;
}

async function keypress() {
    process.stdin.setRawMode(true);
    return new Promise(resolve => process.stdin.once('data', data => {
        const byteArray = [...data];
        if (byteArray.length > 0 && byteArray[0] === 3) {
            console.log('cancel');
            process.exit(1);
        }
        process.stdin.setRawMode(false);
        resolve(byteArray[0]);
    }))
}

// download from url with handle http 302 redirect
async function downloadWithRedirect(url, dest) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, async res => {
            if (res.statusCode === 302) {
                const location = res.headers.location;
                if (location) {
                    await downloadWithRedirect(location, dest).then(resolve).catch(reject);
                } else {
                    reject(new Error('302 redirect but no location header'));
                }
            } else if (res.statusCode === 200) {
                const total = parseInt(res.headers['content-length'], 10);
                let downloaded = 0;
                const file = fs.createWriteStream(dest);
                // show progress
                res.on('data', chunk => {
                    // clean this line
                    downloaded += chunk.length;
                    process.stdout.clearLine();
                    // show downloaded size / total size and download percentage
                    process.stdout.write(`\r${Math.round(downloaded / 1024)}KB/${Math.round(total / 1024)}KB (${Math.round(downloaded / total * 100)}%)`);
                });
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                reject(new Error(`status code ${res.statusCode}`));
            }
        });
        req.on('error', err => {
            reject(err);
        });
    });
}

const pathList = {
    'opencv': {
        OPENCV_INCLUDE_DIR: path.resolve('opencv/build/include'),
        OPENCV_LIB_DIR: path.resolve('opencv/build/x64/vc15/lib'),
        OPENCV_BIN_DIR: path.resolve('opencv/build/x64/vc15/bin'),
    },
    'opencv/opencv': {
        OPENCV_INCLUDE_DIR: path.resolve('opencv/opencv/build/include'),
        OPENCV_LIB_DIR: path.resolve('opencv/opencv/build/x64/vc15/lib'),
        OPENCV_BIN_DIR: path.resolve('opencv/opencv/build/x64/vc15/bin'),
    },
    'env': {
        OPENCV_INCLUDE_DIR: process.env.OPENCV_INCLUDE_DIR ? path.resolve(process.env.OPENCV_INCLUDE_DIR) : undefined,
        OPENCV_LIB_DIR: process.env.OPENCV_LIB_DIR ? path.resolve(process.env.OPENCV_LIB_DIR) : undefined,
        OPENCV_BIN_DIR: process.env.OPENCV_BIN_DIR ? path.resolve(process.env.OPENCV_BIN_DIR) : undefined,
    }
}

async function checkOpenCV() {
    console.log('检查环境变量中的OpenCV目录');
    let exists = false;
    const env = pathList.env;
    for (const [k, p] of Object.entries(env)) {
        if (!p) {
            console.log(`缺失环境变量 ${k}`);
            exists = false;
            break;
        } else {
            if (fs.existsSync(p)) {
                const fstat = fs.statSync(p);
                if (fstat.isDirectory()) {
                    exists = true;
                } else {
                    console.log(`环境变量 ${k} 设置的目录 ${p} 不是目录`);
                    exists = false;
                    break;
                }
            }
        }
    }
    if (exists) {
        console.log('环境变量中的 OpenCV 目录已存在，不需要下载');
        return true;
    }
    console.log('检查 opencv 目录');
    const opencv = pathList.opencv;
    for (const [k, p] of Object.entries(opencv)) {
        if (fs.existsSync(p)) {
            const fstat = fs.statSync(p);
            if (fstat.isDirectory()) {
                exists = true;
            } else {
                console.log(`准备提供给环境变量 ${k} 的路径 ${p} 不是目录`);
                exists = false;
                break;
            }
        } else {
            console.log(`准备提供给环境变量 ${k} 的路径 ${p} 不存在`);
            exists = false;
            break;
        }
    }
    if (exists) {
        console.log('OpenCV 目录已存在，不需要下载');
        process.env.OPENCV4NODEJS_DISABLE_AUTOBUILD = '1';
        process.env.OPENCV_INCLUDE_DIR = opencv.OPENCV_INCLUDE_DIR;
        process.env.OPENCV_LIB_DIR = opencv.OPENCV_LIB_DIR;
        process.env.OPENCV_BIN_DIR = opencv.OPENCV_BIN_DIR;
        return true;
    }
    console.log('检查 opencv/opencv 目录');
    const opencvOpencv = pathList['opencv/opencv'];
    for (const [k, p] of Object.entries(opencvOpencv)) {
        if (fs.existsSync(p)) {
            const fstat = fs.statSync(p);
            if (fstat.isDirectory()) {
                exists = true;
            } else {
                console.log(`准备提供给环境变量 ${k} 的路径 ${p} 不是目录`);
                exists = false;
                break;
            }
        } else {
            console.log(`准备提供给环境变量 ${k} 的路径 ${p} 不存在`);
            exists = false;
            break;
        }
    }
    if (exists) {
        console.log('OpenCV 目录已存在，不需要下载');
        process.env.OPENCV4NODEJS_DISABLE_AUTOBUILD = '1';
        process.env.OPENCV_INCLUDE_DIR = opencvOpencv.OPENCV_INCLUDE_DIR;
        process.env.OPENCV_LIB_DIR = opencvOpencv.OPENCV_LIB_DIR;
        process.env.OPENCV_BIN_DIR = opencvOpencv.OPENCV_BIN_DIR;
        return true;
    } else {
        console.log('OpenCV 目录不存在，需要下载');
        return false;
    }
}


(async () => {

    const is_support_auto_download_opencv = checkPlatform();
    if (!is_support_auto_download_opencv) {
        console.log('当前平台不支持自动下载 OpenCV');
        delete process.env.OPENCV4NODEJS_DISABLE_AUTOBUILD;
        return;
    }

    if (process.env.OPENCV4NODEJS_DISABLE_AUTOBUILD !== '1') {
        console.log('自动构建 OpenCV，不再检查是否配置了 OpenCV');
        process.exit(0);
    }

    const opencv_is_exists = await checkOpenCV();

    if (!opencv_is_exists) {

        console.log('是否下载安装 OpenCV？（Yy/Nn，默认为N）');
        const key1 = await keypress();
        if ([89, 121].includes(key1)) {
            console.log('下载安装 OpenCV...');
            await downloadWithRedirect('https://github.com/opencv/opencv/releases/download/4.6.0/opencv-4.6.0-vc14_vc15.exe', 'opencv/opencv.exe');
            console.log('下载完成！');
            spawnSync('./opencv/opencv.exe', ['-o', './opencv/', '-y']);
        } else {
            console.log('您选择了不下载安装 OpenCV！你需要等候自动编译！如果您想自行配置 OpenCV，请按 Ctrl-C 停止安装进程，请阅读 README.md 查看配置方法');
        }

    }
    console.log('配置环境变量 .env');
    const dotenv_content = `OPENCV4NODEJS_DISABLE_AUTOBUILD=1\n` +
        `OPENCV_INCLUDE_DIR=${process.env.OPENCV_INCLUDE_DIR}\n` +
        `OPENCV_LIB_DIR=${process.env.OPENCV_LIB_DIR}\n` +
        `OPENCV_BIN_DIR=${process.env.OPENCV_BIN_DIR}\n`;
    await writeFile(path.join(__dirname, '.env'), dotenv_content, 'utf8');

})().then(() => {
    console.log('配置完成！');
    return new Promise((resolve) => {
        const cp = spawn('npm.cmd', ['install'], {
            env: process.env,
            cwd: __dirname,
            stdio: 'inherit'
        });
        cp.on('close', (code) => {
            resolve(code);
        }).on('error', (err) => {
            resolve(err);
        }).on('exit', (code) => {
            resolve(code);
        });
    });
}).catch(e => {
    console.error(e);
    process.exit(1);
});