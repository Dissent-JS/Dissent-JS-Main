export default class header {
  constructor(element) {
    this.element = element
    this.scrollThreshold = 50 // Pixels to scroll before starting the color change
    this.isScrolling = false
  }

  async init() {
    if (process.env.NODE_ENV !== 'production') {
      try {
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
      } catch (error) {
        console.error('Failed to load header component:', error);
      }
    }

    // Initialize scroll event listener
    this.initScrollEffect();
  }

  initScrollEffect() {
    // Get the fixed header element
    this.fixedHeader = document.querySelector('.fixed-header');

    if (this.fixedHeader) {
      // Prevent duplicate scroll listeners
      if (this._boundScrollHandler) {
        window.removeEventListener('scroll', this._boundScrollHandler);
      }

      // Add initial transparent background
      this.fixedHeader.style.backgroundColor = 'rgba(0, 0, 0, 0)';
      this.fixedHeader.style.transition = 'background-color 0.3s ease';

      // Store bound reference so we can remove it later
      this._boundScrollHandler = this.handleScroll.bind(this);
      window.addEventListener('scroll', this._boundScrollHandler);

      // Call once to set initial state
      this.handleScroll();
    }
  }

  handleScroll() {
    if (!this.isScrolling) {
      window.requestAnimationFrame(() => {
        const scrollPosition = window.scrollY;

        if (scrollPosition > this.scrollThreshold) {
          // Calculate opacity based on scroll position (max 0.9)
          const opacity = Math.min(0.97, (scrollPosition - this.scrollThreshold) / 150);
          // Use primary color #232340 instead of black
          this.fixedHeader.style.backgroundColor = `rgba(35, 35, 64, ${opacity})`;
        } else {
          // Reset to transparent if at top
          this.fixedHeader.style.backgroundColor = 'rgba(35, 35, 64, 0)';
        }

        this.isScrolling = false;
      });

      this.isScrolling = true;
    }
  }
}
