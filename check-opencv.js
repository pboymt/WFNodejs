const fs = require('node:fs');
const path = require('node:path');
const package = require('./package.json');

const keys = ['disableAutoBuild', 'opencvIncludeDir', 'opencvLibDir', 'opencvBinDir'];

console.log('Checking OpenCV...');

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

console.log('OK');