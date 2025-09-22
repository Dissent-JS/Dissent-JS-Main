export default class nav {
    constructor(element) {
        this.element = element
    }

    async init() {
        if (process.env.NODE_ENV !== 'production') {
            const response = await fetch('layout/nav/nav.html');
            const navHtml = await response.text();
            this.element.innerHTML = navHtml;
        }

        // Add any navigation-specific functionality here
        this.initializeNavLinks();
    }

    // Also expose the class globally for the static build
    static initialize() {
        window.nav = nav;
    }

    initializeNavLinks() {
        // Highlight the active link based on current path
        const path = window.location.pathname.slice(1) || 'home';
        const navLinks = this.element.querySelectorAll('a');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.replace('/', '') === path) {
                link.classList.add('active');
            }
        });
    }
}
