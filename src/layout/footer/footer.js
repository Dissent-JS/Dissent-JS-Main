export default class footer {
  constructor(element) {
    this.element = element
  }

  async init() {
    if (process.env.NODE_ENV !== 'production') {
      try {
        const response = await fetch('layout/footer/footer.html');
        const footerhtml = await response.text();
        this.element.innerHTML = footerhtml;
      } catch (error) {
        console.error('Failed to load footer component:', error);
      }
    }

    // Set the current year in the copyright text
    this.updateCopyrightYear();
  }

  // Also expose the class globally for the static build
  static initialize() {
    window.footer = footer;
  }

  updateCopyrightYear() {
    const yearElement = document.getElementById('copyright-year');
    if (yearElement) {
      const currentYear = new Date().getFullYear();
      yearElement.textContent = currentYear;
    }
  }
}
