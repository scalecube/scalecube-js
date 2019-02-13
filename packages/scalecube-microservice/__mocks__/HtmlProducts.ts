class HtmlProduct extends HTMLElement {
  connectedCallback() {
    this.innerHTML = this.render();
  }

  render() {
    return '<h3>HTML Service</h3>';
  }

  disconnectedCallback() {}

  log(...args) {
    console.warn('️HtmlService ', ...args);
  }
}

export default HtmlProduct;
