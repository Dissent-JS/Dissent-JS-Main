export default class Counter {
  constructor(element, fetchFn = window.fetch.bind(window)) {
    this.element = element;
    this.fetchFn = fetchFn;
  }

  async init() {
    if (process.env.NODE_ENV !== 'production') {
      try {
        const response = await this.fetchFn('./components/counter/counter.html');
        const html = await response.text();
        this.element.innerHTML = html;
      } catch (error) {
        console.error('Failed to load counter component:', error);
        return;
      }
    }

    const myButton = this.element.querySelector('.myButton');
    myButton.onclick = () => {
      const myCounter = this.element.querySelector('.myCounter');
      myCounter.innerHTML = parseInt(myCounter.innerHTML) + 1;
    };
  }
}