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

    // Set the current year in the copyright text
    this.updateCopyrightYear();
  }

  updateCopyrightYear() {
    // Wait for a short moment to ensure the DOM is fully loaded
    setTimeout(() => {
      const yearElement = document.getElementById('copyright-year');
      if (yearElement) {
        // Get the current year and set it in the span
        const currentYear = new Date().getFullYear();
        yearElement.textContent = currentYear;
      }
    }, 100);
  }
}
