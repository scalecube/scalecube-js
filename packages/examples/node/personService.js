const { retryRouterWithLogs } = require('./helpers/retryRouterWithLogs');
const { createMicroservice, ASYNC_MODEL_TYPES } = require('@scalecube/node');

const definition = {
  serviceName: 'PersonService',
  methods: {
    requestGreeting: {
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
    },
  },
};

process.on('message', () => {
  createMicroservice({
    address: {
      protocol: 'ws',
      host: 'localhost',
      port: 6113,
      path: '',
    },
    seedAddress: [
      // seed address not exists (or possible down)
      {
        protocol: 'ws',
        host: 'localhost',
        port: 6115,
        path: '',
      },
      // seed address that exists
      {
        protocol: 'ws',
        host: 'localhost',
        port: 6111,
        path: '',
      },
    ],
    services: [
      {
        // here is example to have dependency on another service,
        // reference can act as a callback function with createProxy || createServiceCall
        // with both it is possible to request a service that this service depended on.
        reference: ({ createProxy }) => {
          // requestGreeting depend on helloService
          const helloDefinition = {
            serviceName: 'HelloService',
            methods: {
              hello: {
                asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
              },
            },
          };
          const helloService = createProxy({ serviceDefinition: helloDefinition });

          return {
            requestGreeting: () =>
              new Promise((resolve, reject) => {
                helloService
                  .hello('from Person service')
                  .then(resolve)
                  .catch((e) => {
                    console.log('requestGreeting error', e.message);
                    reject(`Can't response with hello, please try again later`);
                  });
              }),
          };
        },
        definition,
        defaultRouter: retryRouterWithLogs('personService'),
      },
    ],
  });
});
