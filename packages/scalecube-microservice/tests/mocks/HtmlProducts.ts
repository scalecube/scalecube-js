class HtmlProduct extends HTMLElement {
  public connectedCallback() {
    this.innerHTML = this.render();
  }

  public render() {
    return '<h3>HTML Service</h3>';
  }

  public disconnectedCallback() {}

  public log(...args: any[]) {
    console.warn('️HtmlService ', ...args);
  }
}

export default HtmlProduct;
