const fs = require('fs');
const path = require('path');

function processHeaderAndFooter() {
    const headerFile = './src/layout/header/header.html.template';
    const footerFile = './src/layout/footer/footer.html.template';
    const indexPath = path.join(__dirname, 'src/index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const headerContent = fs.readFileSync(headerFile, 'utf8');
    const footerContent = fs.readFileSync(footerFile, 'utf8');
    const indexHeaderRegex = /<header class="header">([\s\S]*?)<\/header>/;
    const indexFooterRegex = /<footer class="footer">([\s\S]*?)<\/footer>/;
    const indexHeaderMatch = indexHeaderRegex.exec(indexContent);
    const indexFooterMatch = indexFooterRegex.exec(indexContent);

    let updatedIndexContent = indexContent;
    if (indexHeaderMatch) {
        const indexHeaderReplacement = `<header class="header">${headerContent}</header>`;
        updatedIndexContent = updatedIndexContent.replace(indexHeaderMatch[0], indexHeaderReplacement);
    }
    if (indexFooterMatch) {
        const indexFooterReplacement = `<footer class="footer">${footerContent}</footer>`;
        updatedIndexContent = updatedIndexContent.replace(indexFooterMatch[0], indexFooterReplacement);
    }
    fs.writeFileSync(indexPath + ".template", updatedIndexContent);
}

processHeaderAndFooter();
