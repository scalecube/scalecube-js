/**
 * RemoteCall example,
 * adding services to one microservice but using those services from another microservice
 * Simple example of provisioning services from remote microservice by using RSocketTransport
 *
 */

window.addEventListener('DOMContentLoaded', (event) => {
  (function(Microservices, ASYNC_MODEL_TYPES, rxjs) {
    var remoteService = {
      hello: function(name) {
        return new Promise((resolve, reject) => {
          if (!name) {
            reject(new Error('please provide user to greet'));
          } else {
            resolve(`Hello ${name}`);
          }
        });
      },

      greet$: function(greetings) {
        return new rxjs.Observable((observer) => {
          if (!greetings || !Array.isArray(greetings) || greetings.length === 0) {
            observer.error(new Error('please provide Array of greetings'));
          }
          greetings.map((i) => observer.next(`greetings ${i}`));
        });
      },
    };

    var remoteServiceDefinition = {
      serviceName: 'RemoteService',
      methods: {
        hello: {
          asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
        },
        greet$: {
          asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
        },
      },
    };

    var generateAddress = (port) => ({
      host: 'defaultHostName',
      port,
      path: 'defaultPathName',
      protocol: 'pm',
      fullAddress: `pm://defaultHostName:${port}/path`,
    });
    /**
     * Service will be available only after 2s
     */
    setTimeout(() => {
      console.log('provision remote microservice after 2s');
      Microservices.create({
        services: [
          {
            definition: remoteServiceDefinition,
            reference: remoteService,
          },
        ],
        seedAddress: generateAddress(8000),
        address: generateAddress(1234),
      });
    }, 2000);

    var placeHolder = document.getElementById('placeHolder');
    var waitMessage = document.getElementById('waitMessage');

    waitMessage.innerText = 'Wait for service ~ 2s';

    var localMS = Microservices.create({ services: [], seedAddress: generateAddress(8000) });

    var { awaitProxyName } = localMS.createProxies({
      proxies: [
        {
          serviceDefinition: remoteServiceDefinition,
          proxyName: 'awaitProxyName',
        },
      ],
      isAsync: true,
    });

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
  })(window.sc.Microservices, window.sc.ASYNC_MODEL_TYPES, rxjs);
});
