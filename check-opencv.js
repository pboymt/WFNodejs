const { spawn, exec } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const package = require('./package.json');

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
        console.log('OpenCV has been detected as installed manually.');
    } else {
        console.log('OPENCV4NODEJS_DISABLE_AUTOBUILD is set to 1, but environment variables of OpenCV are not been detected as installed manually.');
        checkPackageJson();
    }
} else {
    console.log('Checking package.json...');
    checkPackageJson();
}

const cp = spawn('npm.cmd', ['exec', 'build-opencv', 'rebuild'], {
    stdio: 'inherit', env: {
        OPENCV_LIB_DIR: package.opencv4nodejs.opencvLibDir,
        ...process.env
    }
});

cp.on('exit', (code, signal) => {
    if (code === 0) {
        console.log('OpenCV has been successfully built.');
    } else {
        console.log('OpenCV has not been built.');
    }
});
