const { createMicroservice, ASYNC_MODEL_TYPES } = require('@scalecube/node');
const { retryRouterWithLogs } = require('./helpers/retryRouterWithLogs');

process.on('message', () => {
  const ms = createMicroservice({
    address: {
      protocol: 'ws',
      host: 'localhost',
      port: 4000,
      path: '',
    },
    seedAddress: {
      protocol: 'ws',
      host: 'localhost',
      port: 1000,
      path: '',
    },
    // override the default router (RoundRobin for nodejs) is not needed but possible.
    // in this example, we override it to add retry logic
    defaultRouter: retryRouterWithLogs('greetMePlz'),
  });

  // PersonService definition
  const personDefinition = {
    serviceName: 'PersonService',
    methods: {
      requestGreeting: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      },
    },
  };

  const person = ms.createProxy({
    serviceDefinition: personDefinition,
  });

  person
    .requestGreeting()
    .then((response) => {
      console.log(`\nour distributed environment response with: `, response);
    })
    .catch(console.error);
});
