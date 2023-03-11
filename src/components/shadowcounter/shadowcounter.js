import './shadowcounter.scss'

export default class ShadowCounter {
  constructor(element) {
    this.element = element;
  }

  async init() {
    const shadowRoot = this.element.attachShadow({ mode: 'closed' });

    const response = await fetch('./components/shadowcounter/shadowcounter.html');
    const html = await response.text();
    shadowRoot.innerHTML = html;

    console.log('ShadowCounter initialized');

    const style = document.createElement('style');
    style.textContent = `
      button {
        background-color: #333;
        color: #fff;
        border: none;
        padding: 10px;
        border-radius: 5px;
      }
    `;
    shadowRoot.appendChild(style);

    const myButton = shadowRoot.getElementById('myShadowButton');
    myButton.onclick = () => {
      const myShadowCounter = shadowRoot.getElementById('myShadowCounter');
      myShadowCounter.innerHTML = parseInt(myShadowCounter.innerHTML) + 1;
    };
  }
}




/**
 * Here, we're using the attachShadow method to create a shadow root for the component's element. 
 * We then fetch the component's HTML template, insert it into the shadow root, 
 * and attach event listeners to the shadow root's elements instead of the global document.
 * You can use this modified version of the Counter component in your code, 
 * or use it as a starting point to modify other components to use the shadow DOM.
 * 
 */
