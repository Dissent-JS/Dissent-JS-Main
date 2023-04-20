export default class footer {
  constructor(element) {
    this.element = element
  }

  async init() {

    if (process.env.NODE_ENV !== 'production') {
      const response = await fetch('layout/footer/footer.html');
      const footerhtml = await response.text();
      this.element.innerHTML = footerhtml;
    }
  }
}
