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

            // Add component CSS links to the head for all views
            let cssLinks = '';

            // Add content CSS for the home page
            if (viewName === 'home') {
                cssLinks += '<link rel="stylesheet" href="./components/content/content.css">';
            }

            // Always add layout CSS files (header, footer, nav)
            cssLinks += '<link rel="stylesheet" href="./layout/header/header.css">';
            cssLinks += '<link rel="stylesheet" href="./layout/footer/footer.css">';
            cssLinks += '<link rel="stylesheet" href="./layout/nav/nav.css">';

            // Add all CSS links to the head
            pageHtml = pageHtml.replace('</head>', cssLinks + '</head>');

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
    <title>ideal.ai - Agentic AI Solutions</title>
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
        if (!fs.existsSync(imagesDest)) {
            fs.mkdirSync(imagesDest, { recursive: true });
        }
        copyDirectoryRecursive(imagesSrc, imagesDest);
        console.log('Copied images directory');
    }

    // Copy component files (CSS, JS, HTML)
    copyComponentFiles();

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

// Make sure paths to components work in static build
window.addEventListener('DOMContentLoaded', function() {
    
    // Create layout component classes
    // Footer class
    window.footer = function(element) {
        this.element = element;
        
        this.init = async function() {
            // Update copyright year
            const yearElement = document.getElementById('copyright-year');
            if (yearElement) {
                yearElement.textContent = new Date().getFullYear();
            }
            console.log('Footer component initialized');
        };
    };
    
    // Header class
    window.header = class {
        constructor(element) {
            this.element = element;
            this.scrollThreshold = 50;
            this.isScrolling = false;
        }
        
        async init() {
            this.initScrollEffect();
        }
        
        initScrollEffect() {
            // Wait a moment to ensure DOM is loaded
            setTimeout(() => {
                // Get the fixed header element
                this.fixedHeader = document.querySelector('.fixed-header');
                
                if (this.fixedHeader) {
                    // Add initial transparent background
                    this.fixedHeader.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                    this.fixedHeader.style.transition = 'background-color 0.3s ease';
                    
                    // Add scroll event listener
                    window.addEventListener('scroll', this.handleScroll.bind(this));
                    
                    // Call once to set initial state
                    this.handleScroll();
                }
            }, 100);
        }
        
        handleScroll() {
            if (!this.isScrolling) {
                window.requestAnimationFrame(() => {
                    const scrollPosition = window.scrollY;
                    
                    if (scrollPosition > this.scrollThreshold) {
                        // Calculate opacity based on scroll position (max 0.9)
                        const opacity = Math.min(0.9, (scrollPosition - this.scrollThreshold) / 150);
                        // Use primary color #232340 instead of black
                        this.fixedHeader.style.backgroundColor = 'rgba(35, 35, 64, ' + opacity + ')';
                    } else {
                        // Reset to transparent if at top
                        this.fixedHeader.style.backgroundColor = 'rgba(35, 35, 64, 0)';
                    }
                    
                    this.isScrolling = false;
                });
                
                this.isScrolling = true;
            }
        }
    };
    
    // Nav class
    window.nav = function(element) {
        this.element = element;
        
        this.init = async function() {
            // Highlight active link
            const path = window.location.pathname.slice(1) || 'home';
            const navLinks = this.element.querySelectorAll('nav a');
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.replace('/', '') === path) {
                    link.classList.add('active');
                }
            });
            console.log('Nav component initialized');
        };
    };
    
    // Load and initialize layout scripts
    function loadLayoutScript(name) {
        const script = document.createElement('script');
        script.src = './layout/' + name + '/' + name + '.js';
        script.onload = function() {
            // First check if the component exports a static initialize method to expose the class globally
            if (typeof window[name] !== 'function') {
                // Try to access the default export and expose it globally
                try {
                    // For module-exported components, make them available on window
                    const script = document.createElement('script');
                    const selector = '.' + name;
                    script.textContent = '\\n' +
                        'import(\\'./layout/' + name + '/' + name + '.js\\').then(module => {\\n' +
                        '    window.' + name + ' = module.default;\\n' +
                        '    if (module.default.initialize) {\\n' +
                        '        module.default.initialize();\\n' +
                        '    }\\n' +
                        '    // Initialize all instances\\n' +
                        '    const instances = document.querySelectorAll(\\"' + selector + '\\");\\n' +
                        '    Array.from(instances).forEach(instance => {\\n' +
                        '        new window.' + name + '(instance).init();\\n' +
                        '    });\\n' +
                        '});\\n';
                    script.type = 'module';
                    document.head.appendChild(script);
                } catch (e) {
                                    console.warn('Could not load ' + name + ' as a module: ' + e.message);
                }
            } else {
                // Already defined globally, just initialize
                const instances = document.querySelectorAll('.' + name);
                Array.from(instances).forEach(instance => {
                    new window[name](instance).init();
                });
            }
        };
        document.head.appendChild(script);
        return script;
    }
    
    // Set up classes and initialize methods for static build
    window.footer = class {
        constructor(element) {
            this.element = element;
        }
        
        async init() {
            this.updateCopyrightYear();
        }
        
        updateCopyrightYear() {
            const yearElement = document.getElementById('copyright-year');
            if (yearElement) {
                const currentYear = new Date().getFullYear();
                yearElement.textContent = currentYear;
            }
        }
    };
    
    window.nav = class {
        constructor(element) {
            this.element = element;
        }
        
        async init() {
            this.initializeNavLinks();
        }
        
        initializeNavLinks() {
            // Highlight the active link based on current path
            const path = window.location.pathname.slice(1) || 'home';
            const navLinks = this.element.querySelectorAll('nav a');
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.replace('/', '') === path) {
                    link.classList.add('active');
                }
            });
        }
    };

    
    // Initialize all layout components
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize header
        const headerInstances = document.querySelectorAll('.header');
        Array.from(headerInstances).forEach(instance => {
            new window.header(instance).init();
        });
        
        // Initialize footer
        const footerInstances = document.querySelectorAll('.footer');
        Array.from(footerInstances).forEach(instance => {
            new window.footer(instance).init();
        });
        
        // Initialize nav
        const navElements = document.querySelectorAll('#nav');
        Array.from(navElements).forEach(element => {
            new window.nav(element).init();
        });
        
        // Try to load the layout scripts for additional functionality
        loadLayoutScript('header');
        loadLayoutScript('footer');
        loadLayoutScript('nav');
    });
});
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

// Run the static build
console.log('Building static version of Dissent.js...');
const existingAssets = generateStaticPages();
copyAssets(existingAssets);
minifyHtmlFiles();
console.log('Static build complete! SEO-friendly HTML files generated in dist/');
