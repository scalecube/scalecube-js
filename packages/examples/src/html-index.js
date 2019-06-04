/**
 * Simple example of creating custom-element and consuming it with scalecube
 *
 */

window.addEventListener('DOMContentLoaded', (event) => {
  var removeBtn = document.getElementById('removeCustomEl');
  removeBtn.addEventListener('click', function(ev) {
    document.body.remove();
  });

  (function(Microservices, ASYNC_MODEL_TYPES) {
    function MyEl() {
      return Reflect.construct(HTMLElement, [], this.constructor);
    }

    MyEl.prototype = Object.create(HTMLElement.prototype);
    MyEl.prototype.constructor = MyEl;
    Object.setPrototypeOf(MyEl, HTMLElement);

    var alertFunc = function() {
      alert('Clicked!');
    };

    MyEl.prototype.connectedCallback = function() {
      console.log('connect custom element');
      this.innerHTML = 'Hello world';
      this.addEventListener('click', alertFunc);
    };

    MyEl.prototype.disconnectedCallback = function() {
      console.log('disconnect custom element');
      this.removeEventListener('click', alertFunc);
    };

    var render = function() {
      customElements.define('my-el', MyEl);
      return Promise.resolve();
    };

    var definition = {
      serviceName: 'customEl',
      methods: {
        render: {
          asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
        },
      },
    };

    var proxyName = Microservices.create({
      services: [
        {
          definition: definition,
          reference: {
            render,
          },
        },
      ],
    }).createProxy({
      serviceDefinition: definition,
    });

    proxyName.render();
  })(window.sc.Microservices, window.sc.ASYNC_MODEL_TYPES);
});
