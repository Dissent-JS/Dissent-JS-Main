export default class header {
  constructor(element) {
    this.element = element
  }

  async init() {
    if (process.env.NODE_ENV !== 'production') {
      const response = await fetch('./layout/header/header.html');
      const headerhtml = await response.text();

      if (process.env.NODE_ENV !== 'production') {
        const response2 = await fetch('./layout/nav/nav.html');
        const navhtml = await response2.text();
        this.element.innerHTML = headerhtml;
        const navHolder = document.getElementById('nav');
        navHolder.innerHTML = navhtml;
      } else {
        this.element.innerHTML = headerhtml;
      }
    }
  }
}
