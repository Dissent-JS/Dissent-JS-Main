export default class header {
  constructor(element) {
    this.element = element
  }

  async init() {
    const response = await fetch('./layout/header/header.html');
    const headerhtml = await response.text();
    const response2 = await fetch('./layout/nav/nav.html');
    const navhtml = await response2.text();
    this.element.innerHTML = headerhtml + navhtml;
  }
}
