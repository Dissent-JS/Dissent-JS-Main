import './deleteX.scss'

export default class deleteX {
  constructor(element) {
    this.element = element
  }

  async init() {
    if (process.env.NODE_ENV !== 'production') {
      const response = await fetch('components/deleteX/deleteX.html');
      const deleteXhtml = await response.text();
      this.element.innerHTML = deleteXhtml;
    }
    // your code goes here
  }
}
