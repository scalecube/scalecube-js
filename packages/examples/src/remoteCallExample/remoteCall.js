/**
 * RemoteCall example,
 * adding services to one microservice but using those services from another microservice
 *
 * In this example we will use a service that was created and published in another microservice instance.
 *
 * Scalecube provide us a way to consume the service from any platform.
 */

window.addEventListener('DOMContentLoaded', (event) => {
  (function(Microservices, ASYNC_MODEL_TYPES, utils, definitions) {
    var placeHolder = document.getElementById('placeHolder');
    var waitMessage = document.getElementById('waitMessage');

    waitMessage.innerText = 'Wait for service ~ 2s';

    var localMS = Microservices.create({ services: [], seedAddress: utils.generateAddress(8000) });
    var proxyConfig = {
      proxies: [
        {
          serviceDefinition: definitions.remoteServiceDefinition,
          proxyName: 'awaitProxyName',
        },
      ],
      isAsync: true,
    };
    var { awaitProxyName } = localMS.createProxies(proxyConfig);

    awaitProxyName.then(({ proxy: serviceNameProxy }) => {
      console.log('remote service is available!');
      serviceNameProxy
        .hello('ME!!!')
        .then((response) => {
          createLineHTML({ response, type: ASYNC_MODEL_TYPES.REQUEST_RESPONSE });
        })
        .catch(console.log);

      serviceNameProxy.greet$(['ME!!!', 'YOU!!!']).subscribe((response) => {
        createLineHTML({ response, type: ASYNC_MODEL_TYPES.REQUEST_STREAM });
      });
    });

    function createLineHTML({ response, type }) {
      waitMessage.innerText = 'Service is available:';

      var responseSpan = document.createElement('div');
      responseSpan.innerText = `${type}: ${response}`;
      placeHolder.appendChild(responseSpan);
    }
  })(window.sc.Microservices, window.sc.ASYNC_MODEL_TYPES, utils, definitions);
});
