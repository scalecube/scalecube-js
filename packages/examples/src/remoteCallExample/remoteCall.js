/**
 * RemoteCall example,
 * adding services to one microservice but using those services from another microservice
 *
 * In this example we will use a service that was created and published in another microservice instance.
 *
 * Scalecube provide us a way to consume the service from any platform.
 */

window.addEventListener('DOMContentLoaded', (event) => {
  (function(createMicroservice, ASYNC_MODEL_TYPES, definitions) {
    var placeHolder = document.getElementById('placeHolder');
    var waitMessage = document.getElementById('waitMessage');

    waitMessage.innerText = 'Wait for service ~ 2s';

    var localMS = createMicroservice({ services: [], seedAddress: 'seed', address: 'local' });

    var serviceNameProxy = localMS.createProxy({ serviceDefinition: definitions.remoteServiceDefinition });

    serviceNameProxy
      .hello('ME!!!')
      .then((response) => {
        createLineHTML({ response, type: ASYNC_MODEL_TYPES.REQUEST_RESPONSE });
      })
      .catch(console.log);

    serviceNameProxy.greet$(['ME!!!', 'YOU!!!']).subscribe((response) => {
      createLineHTML({ response, type: ASYNC_MODEL_TYPES.REQUEST_STREAM });
    });

    function createLineHTML({ response, type }) {
      waitMessage.innerText = 'Service is available:';

      var responseSpan = document.createElement('div');
      responseSpan.innerText = `${type}: ${response}`;
      placeHolder.appendChild(responseSpan);
    }
  })(window.sc.createMicroservice, window.sc.ASYNC_MODEL_TYPES, definitions);
});
