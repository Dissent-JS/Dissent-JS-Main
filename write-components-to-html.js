const fs = require('fs');
const path = require('path');

const viewsDirectory = './src/views/';
const layoutDirectory = './src/layout/';
const componentsDirectory = './src/components/';
const navFile = './src/layout/nav/nav.html';


function processMultipleDirectories(...directories) {
    directories.forEach((directory) => {
        processDirectory(directory);
    });
}


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

        // Inject the nav file into the header
        const headerRegex = /<div id="nav">([\s\S]*?)<\/div>/;
        const headerMatch = headerRegex.exec(viewContent);

        if (headerMatch && fs.existsSync(navFile)) {
            const navContent = fs.readFileSync(navFile, 'utf8');
            const headerReplacement = `<div id="nav">${navContent}${headerMatch[1]}</div>`;
            viewContent = viewContent.replace(headerMatch[0], headerReplacement);
        }

        fs.writeFileSync(`${viewFilePath}.template`, viewContent);
    }
}

processMultipleDirectories(viewsDirectory, layoutDirectory);


// Write the updated header into index.html
// setTimeout(() => {
//     const headerFile = './dist/layout/header/header.html';
//     const footerFile = './dist/layout/footer/footer.html';
//     const indexPath = path.join(__dirname, 'src/index.html');
//     const indexContent = fs.readFileSync(indexPath, 'utf8');
//     const headerContent = fs.readFileSync(headerFile, 'utf8');
//     const footerContent = fs.readFileSync(footerFile, 'utf8');
//     const indexHeaderRegex = /<header class="header">([\s\S]*?)<\/header>/;
//     const indexFooterRegex = /<footer class="footer">([\s\S]*?)<\/footer>/;
//     const indexHeaderMatch = indexHeaderRegex.exec(indexContent);
//     const indexFooterMatch = indexFooterRegex.exec(indexContent);
//     let updatedIndexContent = indexContent;
//     if (indexHeaderMatch) {
//         const indexHeaderReplacement = `<header>${headerContent}</header>`;
//         updatedIndexContent = updatedIndexContent.replace(indexHeaderMatch[0], indexHeaderReplacement);
//     }
//     if (indexFooterMatch) {
//         const indexFooterReplacement = `<footer>${footerContent}</footer>`;
//         updatedIndexContent = updatedIndexContent.replace(indexFooterMatch[0], indexFooterReplacement);
//     }
//     console.log('indexPath: ', indexPath)
//     console.log('updatedIndexContent: ', updatedIndexContent)
//     fs.writeFileSync(indexPath + ".template", updatedIndexContent);
// }, 2000);


