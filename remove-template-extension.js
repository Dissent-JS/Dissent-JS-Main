const fs = require('fs');
const path = require('path');

const layoutDirectory = './dist/layout';
const rootDirectory = './dist/';

function processDirectory(directory) {
    if (!fs.existsSync(directory)) {
        console.warn(`Directory not found, skipping: ${directory}`);
        return;
    }
    fs.readdir(directory, (err, items) => {
        if (err) {
            console.error(`Error reading directory ${directory}:`, err.message);
            return;
        }

        items.forEach((item) => {
            const itemPath = path.join(directory, item);
            try {
                const itemStat = fs.statSync(itemPath);
                if (itemStat.isFile()) {
                    renameFile(itemPath);
                } else if (itemStat.isDirectory()) {
                    processDirectory(itemPath);
                }
            } catch (err) {
                console.warn(`Skipping inaccessible path: ${itemPath}`);
            }
        });
    });
}

function renameFile(filePath) {
    const fileExtension = path.extname(filePath);

    if (fileExtension === '.template') {
        if (!fs.existsSync(filePath)) {
            console.warn(`Skipping missing file: ${filePath}`);
            return;
        }
        const newFilePath = filePath.slice(0, -fileExtension.length);
        fs.renameSync(filePath, newFilePath);
        console.log(`Renamed ${filePath} to ${newFilePath}`);
    }
}

processDirectory(layoutDirectory);
processDirectory(rootDirectory);