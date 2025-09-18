function home() {
    console.log('Home');
    // Initialize components
    import('../../components/content/content.js')
        .then(module => {
            const Content = module.default;
            const contentElement = document.querySelector('.content');
            if (contentElement) {
                const contentComponent = new Content(contentElement);
                contentComponent.init();
            }
        })
        .catch(error => console.error('Error loading content component:', error));
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

