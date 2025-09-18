import './content.scss'

export default class Content {
    constructor(element) {
        this.element = element
    }

    async init() {
        if (process.env.NODE_ENV !== 'production') {
            const response = await fetch('components/content/content.html');
            const contentHtml = await response.text();
            this.element.innerHTML = contentHtml;
        }
        // your code goes here
    }
}
