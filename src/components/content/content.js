// Import the stylesheet
document.addEventListener('DOMContentLoaded', function () {
    // Create and append stylesheet link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './components/content/content.css';
    document.head.appendChild(link);
});

class Content {
    constructor(element) {
        this.element = element
    }

    async init() {
        try {
            // Always fetch the HTML content in development environment
            const response = await fetch('components/content/content.html');
            if (!response.ok) {
                throw new Error(`Failed to fetch content.html: ${response.status}`);
            }
            const contentHtml = await response.text();
            this.element.innerHTML = contentHtml;
            console.log('Content component initialized successfully');
        } catch (error) {
            console.error('Error initializing content component:', error);
            this.element.innerHTML = '<div class="panel-container"><div class="panel"><div class="panel-content"><h2>Error Loading Content</h2><p>Please try refreshing the page.</p></div></div></div>';
        }
    }
}

// Make Content available globally
window.Content = Content;
