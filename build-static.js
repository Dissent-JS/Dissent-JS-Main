const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');
const sass = require('sass');

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
        description: 'Learn about Dissent.js - We\'re a team of AI and business experts with a background in the world\'s top consultancies, bringing expertise to businesses of every size with cutting-edge AI solutions.'
    },
    'contact': {
        title: 'Contact - Dissent.js',
        description: 'Get in touch with Dissent.js. We specialize in estate agents and provide Agentic AI solutions across industries to help your business thrive.'
    },
    '404': {
        title: 'Page Not Found - Dissent.js',
        description: 'The page you are looking for could not be found on Dissent.js'
    }
};

function getDefaultMeta() {
    return {
        title: 'Dissent.js - Agentic AI Solutions',
        description: 'Dissent.js delivers seamless Agentic AI solutions that streamline processes, reimagine customer service, and automate workflows. We combine cutting-edge AI with a human-first approach to help businesses of all sizes work smarter, faster, and with greater impact.'
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
    const navPath = path.join(layoutDirectory, 'nav', 'nav.html');

    if (fs.existsSync(headerPath)) {
        const headerContent = fs.readFileSync(headerPath, 'utf8');
        baseTemplate = baseTemplate.replace(/<header class="header">[\s\S]*?<\/header>/, `<header class="header">${headerContent}</header>`);
    }

    // After injecting header, insert nav content into the nav div
    if (fs.existsSync(navPath)) {
        const navContent = fs.readFileSync(navPath, 'utf8');
        baseTemplate = baseTemplate.replace(/<div id="nav"><\/div>/, `<div id="nav">${navContent}</div>`);
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

            // Fix image paths in the generated HTML
            pageHtml = pageHtml.replace(/\.\.\/\.\.\/images\//g, './images/');

            // Fix navigation links for static build (add .html extensions)
            pageHtml = pageHtml.replace(/href="\/home"/g, 'href="index.html"');
            pageHtml = pageHtml.replace(/href="\/(about|contact)"/g, 'href="$1.html"');

            // Add meta tag to indicate this is a static build
            pageHtml = pageHtml.replace('<head>', '<head><meta name="static-build" content="true">');

            // Add component CSS links to the head for all views
            let cssLinks = '';

            // Always add layout CSS files (header, footer, nav)
            cssLinks += '<link rel="stylesheet" href="./layout/header/header.css">';
            cssLinks += '<link rel="stylesheet" href="./layout/footer/footer.css">';
            cssLinks += '<link rel="stylesheet" href="./layout/nav/nav.css">';

            // Add all CSS links to the head
            pageHtml = pageHtml.replace('</head>', cssLinks + '</head>');

            // Remove the router script for static builds since content is embedded
            // pageHtml = pageHtml.replace('<script src="main.min.js"></script>', '');

            // Write the static page
            const outputPath = path.join(distDirectory, `${viewName}.html`);
            fs.writeFileSync(outputPath, pageHtml);
            console.log(`Generated static page: ${outputPath}`);
        }
    });

    // Generate index.html with home page content (no redirect)
    const homeViewPath = path.join(viewsDirectory, 'home', 'home.html');
    if (fs.existsSync(homeViewPath)) {
        let homeContent = fs.readFileSync(homeViewPath, 'utf8');
        homeContent = injectComponents(homeContent);

        // Create full home page HTML for index.html
        let indexHtml = baseTemplate.replace(
            /<div id="view-container"><\/div>/,
            `<div id="view-container">${homeContent}</div>`
        );

        // Update meta tags for home page
        const homeMeta = viewMeta['home'] || getDefaultMeta();
        indexHtml = indexHtml.replace(
            /<title>[^<]*<\/title>/,
            `<title>${homeMeta.title}</title>`
        );
        indexHtml = indexHtml.replace(
            /<meta name="description" content="[^"]*">/,
            `<meta name="description" content="${homeMeta.description}">`
        );

        // Fix image paths
        indexHtml = indexHtml.replace(/\.\.\/\.\.\/images\//g, './images/');

        // Fix navigation links for static build (add .html extensions)
        indexHtml = indexHtml.replace(/href="\/home"/g, 'href="index.html"');
        indexHtml = indexHtml.replace(/href="\/(about|contact)"/g, 'href="$1.html"');

        // Add meta tag to indicate this is a static build
        indexHtml = indexHtml.replace('<head>', '<head><meta name="static-build" content="true">');

        // Add component CSS links to the head
        let cssLinks = '';

        // Always add layout CSS files (header, footer, nav)
        cssLinks += '<link rel="stylesheet" href="./layout/header/header.css">';
        cssLinks += '<link rel="stylesheet" href="./layout/footer/footer.css">';
        cssLinks += '<link rel="stylesheet" href="./layout/nav/nav.css">';

        // Add all CSS links to the head
        indexHtml = indexHtml.replace('</head>', cssLinks + '</head>');

        fs.writeFileSync(path.join(distDirectory, 'index.html'), indexHtml);
        console.log('Generated index.html with home page content');
    }

    // Generate home.html that redirects to index.html (for backward compatibility)
    const homeRedirectContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=index.html">
    <title>Dissent.js - Redirecting</title>
</head>
<body>
    <p>Redirecting to <a href="index.html">home page</a>...</p>
</body>
</html>`;

    fs.writeFileSync(path.join(distDirectory, 'home.html'), homeRedirectContent);
    console.log('Generated home.html redirect to index.html');

    return existingAssets;
}

function copyAssets(existingAssets = {}) {
    // Copy images from src
    const imagesSrc = path.join(__dirname, 'src', 'images');
    const imagesDest = path.join(distDirectory, 'images');
    if (fs.existsSync(imagesSrc)) {
        if (!fs.existsSync(imagesDest)) {
            fs.mkdirSync(imagesDest, { recursive: true });
        }
        copyDirectoryRecursive(imagesSrc, imagesDest);
        console.log('Copied images directory');
    }

    // Copy component files (CSS, JS, HTML)
    copyComponentFiles();

    // For CSS and JS, create fresh minimal versions for static builds
    const assets = ['main.min.css', 'main.min.js'];
    let assetsFound = 0;

    assets.forEach(asset => {
        const destPath = path.join(distDirectory, asset);

        // Always create fresh minimal versions for static builds
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
            // Create a minimal JS file with header scroll effect
            const minimalJs = `
console.log('Static build JS loaded');

// Header scroll effect
(function() {
    const header = document.querySelector('.fixed-header');
    if (header) {
        let lastScrollY = window.scrollY;
        
        function updateHeader() {
            const scrollY = window.scrollY;
            const opacity = Math.min(scrollY / 200, 1);
            header.style.backgroundColor = 'rgba(35, 35, 64, ' + opacity + ')';
            header.style.boxShadow = opacity > 0 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none';
            lastScrollY = scrollY;
        }
        
        window.addEventListener('scroll', updateHeader);
        updateHeader(); // Initial call
    }
})();

// Simple navigation initialization
document.addEventListener('DOMContentLoaded', function() {
    // Highlight active nav link
    const path = window.location.pathname.slice(1) || 'home';
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.replace('/', '') === path) {
            link.classList.add('active');
        }
    });
});
`;
            fs.writeFileSync(destPath, minimalJs.trim());
            console.log(`Created minimal JS: ${asset}`);
            assetsFound++;
        }
    });

    if (assetsFound < assets.length) {
        console.log(`Note: Created ${assetsFound}/${assets.length} assets. For full functionality, run 'yarn build' first.`);
    }
}

// Function to copy component files
function copyComponentFiles() {
    // Copy component files
    const componentsSrc = path.join(__dirname, 'src', 'components');
    const componentsDest = path.join(distDirectory, 'components');

    if (fs.existsSync(componentsSrc)) {
        if (!fs.existsSync(componentsDest)) {
            fs.mkdirSync(componentsDest, { recursive: true });
        }

        console.log('Copied component files');
    }

    // Copy layout files (header and footer)
    copyLayoutFiles();

    // Copy view files
    copyViewFiles();
}

// Function to copy layout files (header and footer)
function copyLayoutFiles() {
    const layoutSrc = path.join(__dirname, 'src', 'layout');
    const layoutDest = path.join(distDirectory, 'layout');

    if (fs.existsSync(layoutSrc)) {
        if (!fs.existsSync(layoutDest)) {
            fs.mkdirSync(layoutDest, { recursive: true });
        }

        // Copy header files
        copyLayoutComponent('header', layoutSrc, layoutDest);

        // Copy footer files
        copyLayoutComponent('footer', layoutSrc, layoutDest);

        // Copy nav files
        copyLayoutComponent('nav', layoutSrc, layoutDest);

        console.log('Copied layout component files');
    }
}

// Function to copy view files
function copyViewFiles() {
    const viewsSrc = path.join(__dirname, 'src', 'views');
    const viewsDest = path.join(distDirectory, 'views');

    if (fs.existsSync(viewsSrc)) {
        if (!fs.existsSync(viewsDest)) {
            fs.mkdirSync(viewsDest, { recursive: true });
        }

        // Get all views
        const views = fs.readdirSync(viewsSrc).filter(item => {
            const itemPath = path.join(viewsSrc, item);
            return fs.statSync(itemPath).isDirectory();
        });

        // Copy each view's files
        views.forEach(viewName => {
            copyViewComponent(viewName, viewsSrc, viewsDest);
        });

        console.log('Copied view component files');
    }
}

// Helper function to copy a layout component
function copyLayoutComponent(componentName, layoutSrc, layoutDest) {
    const componentSrc = path.join(layoutSrc, componentName);
    if (fs.existsSync(componentSrc)) {
        const componentDest = path.join(layoutDest, componentName);
        if (!fs.existsSync(componentDest)) {
            fs.mkdirSync(componentDest, { recursive: true });
        }

        // Copy HTML
        const htmlFile = path.join(componentSrc, `${componentName}.html`);
        if (fs.existsSync(htmlFile)) {
            fs.copyFileSync(htmlFile, path.join(componentDest, `${componentName}.html`));
        }

        // Copy JS
        const jsFile = path.join(componentSrc, `${componentName}.js`);
        if (fs.existsSync(jsFile)) {
            fs.copyFileSync(jsFile, path.join(componentDest, `${componentName}.js`));
        }

        // Process SCSS to CSS
        const scssFile = path.join(componentSrc, `${componentName}.scss`);
        if (fs.existsSync(scssFile)) {
            try {
                // Try to use sass compiler if available
                const sass = require('sass');
                const result = sass.renderSync({
                    file: scssFile,
                    includePaths: [path.join(__dirname, 'src/styles')]
                });

                // Write the compiled CSS
                fs.writeFileSync(
                    path.join(componentDest, `${componentName}.css`),
                    result.css.toString()
                );
                console.log(`Compiled SCSS for ${componentName}`);
            } catch (error) {
                console.log(`Could not compile SCSS for ${componentName}, falling back to copying: ${error.message}`);

                // If sass compiler not available, fall back to copying
                const cssFile = path.join(componentSrc, `${componentName}.css`);
                if (fs.existsSync(cssFile)) {
                    fs.copyFileSync(cssFile, path.join(componentDest, `${componentName}.css`));
                } else {
                    // Last resort: just copy the SCSS as CSS
                    fs.copyFileSync(scssFile, path.join(componentDest, `${componentName}.css`));
                }
            }
        } else {
            // If no SCSS, try copying existing CSS
            const cssFile = path.join(componentSrc, `${componentName}.css`);
            if (fs.existsSync(cssFile)) {
                fs.copyFileSync(cssFile, path.join(componentDest, `${componentName}.css`));
            }
        }
    }
}

// Helper function to copy a view component
function copyViewComponent(viewName, viewsSrc, viewsDest) {
    const viewSrc = path.join(viewsSrc, viewName);
    if (fs.existsSync(viewSrc)) {
        const viewDest = path.join(viewsDest, viewName);
        if (!fs.existsSync(viewDest)) {
            fs.mkdirSync(viewDest, { recursive: true });
        }

        // Copy HTML
        const htmlFile = path.join(viewSrc, `${viewName}.html`);
        if (fs.existsSync(htmlFile)) {
            fs.copyFileSync(htmlFile, path.join(viewDest, `${viewName}.html`));
        }

        // Copy JS
        const jsFile = path.join(viewSrc, `${viewName}.js`);
        if (fs.existsSync(jsFile)) {
            fs.copyFileSync(jsFile, path.join(viewDest, `${viewName}.js`));
        }

        // Process SCSS to CSS
        const scssFile = path.join(viewSrc, `${viewName}.scss`);
        if (fs.existsSync(scssFile)) {
            try {
                // Try to use sass compiler if available
                const sass = require('sass');
                const result = sass.renderSync({
                    file: scssFile,
                    includePaths: [path.join(__dirname, 'src/styles')]
                });

                // Write the compiled CSS
                fs.writeFileSync(
                    path.join(viewDest, `${viewName}.css`),
                    result.css.toString()
                );
                console.log(`Compiled SCSS for ${viewName} view`);
            } catch (error) {
                console.log(`Could not compile SCSS for ${viewName} view, falling back to copying: ${error.message}`);

                // If sass compiler not available, fall back to copying
                const cssFile = path.join(viewSrc, `${viewName}.css`);
                if (fs.existsSync(cssFile)) {
                    fs.copyFileSync(cssFile, path.join(viewDest, `${viewName}.css`));
                } else {
                    // Last resort: just copy the SCSS as CSS
                    fs.copyFileSync(scssFile, path.join(viewDest, `${viewName}.css`));
                }
            }
        } else {
            // If no SCSS, try copying existing CSS
            const cssFile = path.join(viewSrc, `${viewName}.css`);
            if (fs.existsSync(cssFile)) {
                fs.copyFileSync(cssFile, path.join(viewDest, `${viewName}.css`));
            }
        }
    }
}

// Helper function to copy directory recursively
function copyDirectoryRecursive(source, destination) {
    const entries = fs.readdirSync(source, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = path.join(source, entry.name);
        const destPath = path.join(destination, entry.name);

        if (entry.isDirectory()) {
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
            }
            copyDirectoryRecursive(sourcePath, destPath);
        } else {
            fs.copyFileSync(sourcePath, destPath);
        }
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

function mergeAllCSSIntoMain() {
    const mainCssPath = path.join(distDirectory, 'main.min.css');

    // Check if main.min.css exists
    if (!fs.existsSync(mainCssPath)) {
        console.log('main.min.css not found, skipping CSS merge');
        return;
    }

    // Start fresh with global styles compiled from source
    let finalCssContent = '';

    // Compile global styles in the correct order
    const globalStyles = [
        'src/styles/normalise.scss',
        'src/styles/boilerplate.scss',
        'src/styles/variables.scss',
        'src/styles/mixin.scss',
        'src/styles/global.scss',
        'src/styles/typography.scss'
    ];

    globalStyles.forEach(stylePath => {
        const fullPath = path.join(__dirname, stylePath);
        if (fs.existsSync(fullPath)) {
            try {
                const result = sass.renderSync({
                    file: fullPath,
                    includePaths: [path.join(__dirname, 'src/styles')]
                });
                finalCssContent += result.css.toString();
                console.log(`Compiled global style: ${stylePath}`);
            } catch (error) {
                console.error(`Error compiling ${stylePath}:`, error.message);
            }
        }
    });

    let cssAdded = false;

    // Layout components to merge (in dependency order)
    const layoutComponents = ['header', 'nav', 'footer'];

    layoutComponents.forEach(componentName => {
        const componentCssPath = path.join(distDirectory, 'layout', componentName, `${componentName}.css`);

        if (fs.existsSync(componentCssPath)) {
            const componentCss = fs.readFileSync(componentCssPath, 'utf8');
            if (componentCss.trim()) {
                finalCssContent += '\n/* ' + componentName + ' styles */\n' + componentCss;
                cssAdded = true;
                console.log(`Merged ${componentName}.css into main.min.css`);
            }
        }
    });

    // View components to merge (views should come last to override layout styles)
    const viewComponents = ['home', 'about', 'contact', '404'];

    viewComponents.forEach(viewName => {
        const viewCssPath = path.join(distDirectory, 'views', viewName, `${viewName}.css`);

        if (fs.existsSync(viewCssPath)) {
            const viewCss = fs.readFileSync(viewCssPath, 'utf8');
            if (viewCss.trim()) {
                finalCssContent += '\n/* ' + viewName + ' view styles */\n' + viewCss;

                cssAdded = true;
                console.log(`Merged ${viewName} view CSS into main.min.css`);
            }
        }
    });

    if (cssAdded || finalCssContent.trim()) {
        // Write the merged CSS back (this replaces the webpack CSS with properly ordered CSS)
        fs.writeFileSync(mainCssPath, finalCssContent);

        // Remove separate CSS link tags from all HTML files
        const files = fs.readdirSync(distDirectory);
        const htmlFiles = files.filter(file => file.endsWith('.html'));

        htmlFiles.forEach(fileName => {
            const filePath = path.join(distDirectory, fileName);
            let content = fs.readFileSync(filePath, 'utf8');

            // Remove the layout CSS links
            content = content.replace('<link rel="stylesheet" href="./layout/header/header.css">', '');
            content = content.replace('<link rel="stylesheet" href="./layout/footer/footer.css">', '');
            content = content.replace('<link rel="stylesheet" href="./layout/nav/nav.css">', '');

            fs.writeFileSync(filePath, content);
        });

        console.log('Merged all CSS into main.min.css and removed separate link tags');
    } else {
        console.log('No CSS found to merge');
    }
}

// Run the static build
console.log('Building static version of Dissent.js...');
const existingAssets = generateStaticPages();
copyAssets(existingAssets);
mergeAllCSSIntoMain();
minifyHtmlFiles();
console.log('Static build complete! SEO-friendly HTML files generated in dist/');
