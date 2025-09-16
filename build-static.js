const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

const viewsDirectory = './src/views/';
const layoutDirectory = './src/layout/';
const componentsDirectory = './src/components/';
const distDirectory = './dist/';

// Meta tags configuration for each view
const viewMeta = {
    'home': {
        title: 'Home - Dissent.js',
        description: 'Welcome to Dissent.js - A lightweight JavaScript framework for building modern web applications'
    },
    'about': {
        title: 'About - Dissent.js',
        description: 'Learn about Dissent.js - A clean, lightweight JavaScript library for simplified web development'
    },
    '404': {
        title: 'Page Not Found - Dissent.js',
        description: 'The page you are looking for could not be found'
    }
};

function getDefaultMeta() {
    return {
        title: 'Dissent.js',
        description: 'Discover Dissent.js, a lightweight, flexible JavaScript framework for building modern web applications'
    };
}

function injectComponents(content) {
    const componentRegex = /<div class="([\w-]+)"><\/div>/g;
    let processedContent = content;
    let match;

    while ((match = componentRegex.exec(content)) !== null) {
        const componentName = match[1];
        const componentHtmlPath = path.join(componentsDirectory, componentName, `${componentName}.html`);

        if (fs.existsSync(componentHtmlPath)) {
            const componentContent = fs.readFileSync(componentHtmlPath, 'utf8');
            const replacement = `<div class="${componentName}">${componentContent}</div>`;
            processedContent = processedContent.replace(match[0], replacement);
        }
    }

    return processedContent;
}

function generateStaticPages() {
    // Check for existing assets before cleaning
    const existingAssets = {};
    const assets = ['main.min.css', 'main.min.js'];
    assets.forEach(asset => {
        const assetPath = path.join(__dirname, 'dist', asset);
        if (fs.existsSync(assetPath)) {
            existingAssets[asset] = fs.readFileSync(assetPath, 'utf8');
        }
    });

    // Clean and recreate dist directory
    if (fs.existsSync(distDirectory)) {
        fs.rmSync(distDirectory, { recursive: true, force: true });
    }
    fs.mkdirSync(distDirectory, { recursive: true });

    // Read the base template
    const baseTemplatePath = path.join(__dirname, 'src', 'index.html');
    let baseTemplate = fs.readFileSync(baseTemplatePath, 'utf8');

    // Inject header and footer into base template
    const headerPath = path.join(layoutDirectory, 'header', 'header.html');
    const footerPath = path.join(layoutDirectory, 'footer', 'footer.html');

    if (fs.existsSync(headerPath)) {
        const headerContent = fs.readFileSync(headerPath, 'utf8');
        baseTemplate = baseTemplate.replace(/<header class="header">[\s\S]*?<\/header>/, `<header class="header">${headerContent}</header>`);
    }

    if (fs.existsSync(footerPath)) {
        const footerContent = fs.readFileSync(footerPath, 'utf8');
        baseTemplate = baseTemplate.replace(/<footer class="footer">[\s\S]*?<\/footer>/, `<footer class="footer">${footerContent}</footer>`);
    }

    // Get all views
    const views = fs.readdirSync(viewsDirectory).filter(item => {
        const itemPath = path.join(viewsDirectory, item);
        return fs.statSync(itemPath).isDirectory();
    });

    // Generate page for each view
    views.forEach(viewName => {
        const viewHtmlPath = path.join(viewsDirectory, viewName, `${viewName}.html`);

        if (fs.existsSync(viewHtmlPath)) {
            let viewContent = fs.readFileSync(viewHtmlPath, 'utf8');

            // Inject components into view content
            viewContent = injectComponents(viewContent);

            // Create full page HTML
            let pageHtml = baseTemplate.replace(
                /<div id="view-container"><\/div>/,
                `<div id="view-container">${viewContent}</div>`
            );

            // Update meta tags
            const meta = viewMeta[viewName] || getDefaultMeta();
            pageHtml = pageHtml.replace(
                /<title>[^<]*<\/title>/,
                `<title>${meta.title}</title>`
            );
            pageHtml = pageHtml.replace(
                /<meta name="description" content="[^"]*">/,
                `<meta name="description" content="${meta.description}">`
            );

            // Write the static page
            const outputPath = path.join(distDirectory, `${viewName}.html`);
            fs.writeFileSync(outputPath, pageHtml);
            console.log(`Generated static page: ${outputPath}`);
        }
    });

    // Generate index.html that redirects to home.html
    const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=home.html">
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecting to <a href="home.html">home page</a>...</p>
</body>
</html>`;

    fs.writeFileSync(path.join(distDirectory, 'index.html'), indexContent);
    console.log('Generated index.html redirect');

    return existingAssets;
}

function copyAssets(existingAssets = {}) {
    // Copy images from src
    const imagesSrc = path.join(__dirname, 'src', 'images');
    const imagesDest = path.join(distDirectory, 'images');
    if (fs.existsSync(imagesSrc)) {
        fs.cpSync(imagesSrc, imagesDest, { recursive: true });
        console.log('Copied images directory');
    }

    // For CSS and JS, use existing assets if available, otherwise create minimal versions
    const assets = ['main.min.css', 'main.min.js'];
    let assetsFound = 0;

    assets.forEach(asset => {
        const destPath = path.join(distDirectory, asset);

        if (existingAssets[asset]) {
            // Use the asset that was captured before cleaning
            fs.writeFileSync(destPath, existingAssets[asset]);
            console.log(`Used existing asset: ${asset}`);
            assetsFound++;
        } else {
            // Create minimal fallback assets
            if (asset === 'main.min.css') {
                // Create a minimal CSS file
                const minimalCss = `
/* Minimal styles for Dissent.js static build */
body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
header, footer { padding: 1rem; background: #f5f5f5; }
main { padding: 2rem; }
h1, h2, h3 { color: #333; }
a { color: #007acc; text-decoration: none; }
a:hover { text-decoration: underline; }
`;
                fs.writeFileSync(destPath, minimalCss.trim());
                console.log(`Created minimal CSS: ${asset}`);
                assetsFound++;
            } else if (asset === 'main.min.js') {
                // Create a minimal JS file or skip it
                const minimalJs = `
// Minimal JavaScript for Dissent.js static build
console.log('Dissent.js static build loaded');
`;
                fs.writeFileSync(destPath, minimalJs.trim());
                console.log(`Created minimal JS: ${asset}`);
                assetsFound++;
            }
        }
    });

    if (assetsFound < assets.length) {
        console.log(`Note: Created ${assetsFound}/${assets.length} assets. For full functionality, run 'yarn build' first.`);
    }
}

function minifyHtmlFiles() {
    // Dynamically find all HTML files in the dist directory
    const files = fs.readdirSync(distDirectory);
    const htmlFiles = files.filter(file => file.endsWith('.html'));

    console.log(`Found ${htmlFiles.length} HTML files to minify: ${htmlFiles.join(', ')}`);

    htmlFiles.forEach(fileName => {
        const filePath = path.join(distDirectory, fileName);
        const content = fs.readFileSync(filePath, 'utf8');
        minify(content, {
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true,
            minifyCSS: true,
        })
            .then(minified => {
                fs.writeFileSync(filePath, minified);
                console.log(`Minified: ${fileName}`);
            })
            .catch(err => {
                console.error(`Error minifying ${fileName}:`, err);
            });
    });
}

// Run the static build
console.log('Building static version of Dissent.js...');
const existingAssets = generateStaticPages();
copyAssets(existingAssets);
minifyHtmlFiles();
console.log('Static build complete! SEO-friendly HTML files generated in dist/');
