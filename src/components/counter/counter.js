import './counter.scss'

export default class Counter {
  constructor(element, fetchFn = window.fetch.bind(window)) {
    this.element = element;
    this.fetchFn = fetchFn;
  }

  async init() {
    const response = await this.fetchFn('./components/counter/counter.html');
    const html = await response.text();
    this.element.innerHTML = html;

    const myButton = this.element.querySelector('.myButton');
    myButton.onclick = () => {
      console.log('Button clicked!');
      const myCounter = this.element.querySelector('.myCounter');
      myCounter.innerHTML = parseInt(myCounter.innerHTML) + 1;
    };
  }
}