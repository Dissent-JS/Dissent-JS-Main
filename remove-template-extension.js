const fs = require('fs');
const path = require('path');

const viewsDirectory = './dist/views';

function processDirectory(directory) {
    fs.readdir(directory, (err, items) => {
        if (err) throw err;

        items.forEach((item) => {
            const itemPath = path.join(directory, item);
            const itemStat = fs.statSync(itemPath);

            if (itemStat.isFile()) {
                renameFile(itemPath);
            } else if (itemStat.isDirectory()) {
                processDirectory(itemPath);
            }
        });
    });
}

function renameFile(filePath) {
    const fileExtension = path.extname(filePath);

    // Only process .template files
    if (fileExtension === '.template') {
        const newFilePath = filePath.slice(0, -fileExtension.length);
        fs.renameSync(filePath, newFilePath);
        console.log(`Renamed ${filePath} to ${newFilePath}`);
    }
}

processDirectory(viewsDirectory);
