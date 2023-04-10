const fs = require('fs');
const path = require('path');

const viewsDirectory = './src/views/';
const componentsDirectory = './src/components/';

function processDirectory(directory) {
    fs.readdir(directory, (err, items) => {
        if (err) throw err;

        items.forEach((item) => {
            const itemPath = path.join(directory, item);
            const itemStat = fs.statSync(itemPath);

            if (itemStat.isFile()) {
                processViewFile(itemPath);
            } else if (itemStat.isDirectory()) {
                processDirectory(itemPath);
            }
        });
    });
}

function processViewFile(viewFilePath) {
    const fileExtension = path.extname(viewFilePath);

    // Only process .html files
    if (fileExtension === '.html') {
        let viewContent = fs.readFileSync(viewFilePath, 'utf8');
        console.log('viewFilePath: ', viewFilePath);
        const componentRegex = /<div class="([\w-]+)"><\/div>/g;
        let match;

        while ((match = componentRegex.exec(viewContent)) !== null) {
            const componentName = match[1];
            const componentHtmlPath = path.join(componentsDirectory, componentName, `${componentName}.html`);

            if (fs.existsSync(componentHtmlPath)) {
                const componentContent = fs.readFileSync(componentHtmlPath, 'utf8');
                const replacement = `<div class="${componentName}">${componentContent}</div>`;
                viewContent = viewContent.replace(match[0], replacement);
            }
        }

        fs.writeFileSync(`${viewFilePath}.template`, viewContent);
    }
}


processDirectory(viewsDirectory);
