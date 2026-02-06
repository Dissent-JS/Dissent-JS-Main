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
        const footerContent = fs.readFileSync(footerPath, 'utf8')
            .replace(/<!--.*?-->/gs, '') // Strip HTML comments
            .trim();
        // footerContent already contains <footer class="footer">...</footer>,
        // so replace the entire empty footer tag with the content directly
        baseTemplate = baseTemplate.replace(/<footer class="footer">[\s\S]*?<\/footer>/, footerContent);
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
    // Copy _headers file for static-host security headers
    const headersFile = path.join(__dirname, '_headers');
    if (fs.existsSync(headersFile)) {
        fs.copyFileSync(headersFile, path.join(distDirectory, '_headers'));
        console.log('Copied _headers file to dist/');
    }

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

    // Create a minimal CSS placeholder (will be replaced by mergeAllCSSIntoMain)
    const cssPath = path.join(distDirectory, 'main.min.css');
    fs.writeFileSync(cssPath, '/* placeholder - replaced by mergeAllCSSIntoMain */');
    console.log('Created CSS placeholder');

    // Build main.min.js by bundling real component/view/layout JS
    const jsPath = path.join(distDirectory, 'main.min.js');
    fs.writeFileSync(jsPath, buildStaticJS());
    console.log('Created bundled static JS: main.min.js');
}

/**
 * Reads a JS source file, strips ES module syntax (import/export),
 * removes fetch-based HTML loading blocks (HTML is already baked into static pages),
 * and removes process.env checks.
 */
function stripModuleSyntax(code) {
    // Remove all import lines (with or without semicolons, any quote style)
    code = code.replace(/^import\s+.*$/gm, '');
    // Remove "export default class X {" → "class X {"
    code = code.replace(/export\s+default\s+class\s+/g, 'class ');
    // Remove "export default" on its own
    code = code.replace(/export\s+default\s+/g, '');
    return code;
}

/**
 * Extract the class name from component source code.
 * Handles "class Foo {" patterns after stripModuleSyntax has been applied.
 */
function extractClassName(code) {
    const match = code.match(/class\s+(\w+)\s*[\{(]/);
    return match ? match[1] : null;
}

/**
 * Builds a complete self-contained JS bundle for the static site
 * by reading actual source files and adapting them for static use.
 */
function buildStaticJS() {
    const parts = [];

    parts.push(`// Dissent.js Static Build - Auto-generated by build-static.js`);
    parts.push(`'use strict';`);
    parts.push(``);

    // ── Layout: Header scroll effect ──
    parts.push(`// ── Header scroll effect ──`);
    parts.push(`(function() {
    var scrollThreshold = 50;
    var isScrolling = false;
    var fixedHeader = document.querySelector('.fixed-header');
    if (!fixedHeader) return;
    fixedHeader.style.backgroundColor = 'rgba(35, 35, 64, 0)';
    fixedHeader.style.transition = 'background-color 0.3s ease';
    function handleScroll() {
        if (isScrolling) return;
        window.requestAnimationFrame(function() {
            var scrollY = window.scrollY;
            if (scrollY > scrollThreshold) {
                var opacity = Math.min(0.97, (scrollY - scrollThreshold) / 150);
                fixedHeader.style.backgroundColor = 'rgba(35, 35, 64, ' + opacity + ')';
            } else {
                fixedHeader.style.backgroundColor = 'rgba(35, 35, 64, 0)';
            }
            isScrolling = false;
        });
        isScrolling = true;
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();
})();`);
    parts.push(``);

    // ── Layout: Footer copyright year ──
    parts.push(`// ── Footer copyright year ──`);
    parts.push(`(function() {
    var yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})();`);
    parts.push(``);

    // ── Layout: Nav active link highlighting ──
    parts.push(`// ── Nav active link highlighting ──`);
    parts.push(`(function() {
    var pagePath = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    if (pagePath === 'index') pagePath = 'home';
    document.querySelectorAll('nav a').forEach(function(link) {
        var href = (link.getAttribute('href') || '').replace('.html', '').replace('/', '');
        if (href === 'index') href = 'home';
        if (href === pagePath) link.classList.add('active');
    });
})();`);
    parts.push(``);

    // ── Components: Read and bundle each one ──
    const componentsSrc = path.join(__dirname, 'src', 'components');
    if (fs.existsSync(componentsSrc)) {
        const components = fs.readdirSync(componentsSrc).filter(item =>
            fs.statSync(path.join(componentsSrc, item)).isDirectory()
        );

        components.forEach(name => {
            const jsFile = path.join(componentsSrc, name, `${name}.js`);
            if (!fs.existsSync(jsFile)) return;

            let code = fs.readFileSync(jsFile, 'utf8');
            code = stripModuleSyntax(code);

            // Remove the entire "if (process.env.NODE_ENV !== 'production') { ... }" fetch block
            // These blocks load HTML via fetch — unnecessary in static build as HTML is already embedded
            code = code.replace(
                /if\s*\(\s*process\.env\.NODE_ENV\s*!==\s*['"]production['"]\s*\)\s*\{[\s\S]*?\n    \}/,
                '// HTML already embedded in static build'
            );

            // Detect the actual class name from source (may differ in case from dir name)
            const className = extractClassName(code) || name;

            parts.push(`// ── Component: ${name} ──`);
            // Wrap each component in an IIFE that finds its container and initializes
            parts.push(`(function() {
    var containers = document.querySelectorAll('.${name}');
    if (!containers.length) return;

    ${code.trim()}

    containers.forEach(function(el) {
        try {
            var instance = new ${className}(el);
            // Call the most specific init method available
            if (typeof instance.initializeTodoComponent === 'function') {
                instance.initializeTodoComponent();
            } else if (typeof instance.init === 'function') {
                instance.init();
            }
        } catch(e) {
            console.error('Failed to initialize component ${name}:', e);
        }
    });
})();`);
            parts.push(``);
        });
    }

    // ── Views: Read and bundle each one ──
    const viewsSrc = path.join(__dirname, 'src', 'views');
    if (fs.existsSync(viewsSrc)) {
        const views = fs.readdirSync(viewsSrc).filter(item =>
            fs.statSync(path.join(viewsSrc, item)).isDirectory()
        );

        views.forEach(viewName => {
            const jsFile = path.join(viewsSrc, viewName, `${viewName}.js`);
            if (!fs.existsSync(jsFile)) return;

            let code = fs.readFileSync(jsFile, 'utf8');

            // Remove block comments (e.g. /* istanbul ignore else */)
            code = code.replace(/\/\*[\s\S]*?\*\//g, '');
            // Remove the entire "if (typeof module ...)" block including nested braces
            code = code.replace(/if\s*\(typeof\s+module\s*!==\s*['"]undefined['"]\s*(?:&&\s*module\.exports\s*)?\)\s*\{[\s\S]*?\n\}/g, '');
            // Remove "window.x = x;" assignments
            code = code.replace(/window\.\w+\s*=\s*\w+;\s*/g, '');

            // Clean up trailing semicolons on their own line and multiple blank lines
            code = code.replace(/^\s*;\s*$/gm, '');
            code = code.replace(/\n{3,}/g, '\n');

            const trimmed = code.trim();
            if (!trimmed) return;

            parts.push(`// ── View: ${viewName} ──`);
            parts.push(`(function() {
    ${trimmed}

    // Auto-call the view function if it exists and we're on that page
    var pagePath = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    if (pagePath === 'index') pagePath = 'home';
    if (pagePath === '${viewName}' && typeof ${viewName} === 'function') {
        ${viewName}();
    }
})();`);
            parts.push(``);
        });
    }

    return parts.join('\n');
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

async function minifyHtmlFiles() {
    // Dynamically find all HTML files in the dist directory
    const files = fs.readdirSync(distDirectory);
    const htmlFiles = files.filter(file => file.endsWith('.html'));

    console.log(`Found ${htmlFiles.length} HTML files to minify: ${htmlFiles.join(', ')}`);

    const minifyPromises = htmlFiles.map(async (fileName) => {
        const filePath = path.join(distDirectory, fileName);
        const content = fs.readFileSync(filePath, 'utf8');
        try {
            const minified = await minify(content, {
                collapseWhitespace: true,
                removeComments: true,
                minifyJS: true,
                minifyCSS: true,
            });
            fs.writeFileSync(filePath, minified);
            console.log(`Minified: ${fileName}`);
        } catch (err) {
            console.error(`Error minifying ${fileName}:`, err);
        }
    });

    await Promise.all(minifyPromises);
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
(async () => {
    console.log('Building static version of Dissent.js...');
    const existingAssets = generateStaticPages();
    copyAssets(existingAssets);
    mergeAllCSSIntoMain();
    await minifyHtmlFiles();
    console.log('Static build complete! SEO-friendly HTML files generated in dist/');
})();
