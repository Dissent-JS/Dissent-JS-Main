function home() {
    console.log('Home page initialized');

    // Function to initialize the content component
    function initializeContentComponent() {
        // Check if Content class already exists globally
        if (typeof window.Content !== 'undefined') {
            const contentElement = document.querySelector('.content');
            if (contentElement) {
                console.log('Content element found, initializing component');
                const contentComponent = new window.Content(contentElement);
                contentComponent.init().catch(err => {
                    console.error('Error during content initialization:', err);
                });
            } else {
                console.error('Content element not found in the DOM');
            }
            return;
        }

        // Content class doesn't exist, load the script and CSS
        // First, load the CSS
        const contentCss = document.createElement('link');
        contentCss.rel = 'stylesheet';
        contentCss.href = './components/content/content.css';
        document.head.appendChild(contentCss);

        // Then load the script
        const contentScript = document.createElement('script');
        contentScript.src = './components/content/content.js';
        contentScript.onload = function () {
            if (typeof window.Content !== 'undefined') {
                const contentElement = document.querySelector('.content');
                if (contentElement) {
                    console.log('Content element found, initializing component');
                    const contentComponent = new window.Content(contentElement);
                    contentComponent.init().catch(err => {
                        console.error('Error during content initialization:', err);
                    });
                } else {
                    console.error('Content element not found in the DOM');
                }
            } else {
                console.error('Content class not found after loading script');
            }
        };
        contentScript.onerror = function (err) {
            console.error('Failed to load content component script:', err);
        };

        // Add script to head
        document.head.appendChild(contentScript);
    }

    // Wait a short time to ensure DOM is fully loaded with the view content
    setTimeout(initializeContentComponent, 100);
}

try {
    if (process.env.NODE_ENV === 'test') {
        module.exports = { home };
    }
} catch (error) {
    if (!(error.name === 'ReferenceError' && error.message.includes('process is not defined'))) {
        console.error('An unexpected error occurred:', error);
    }
}

