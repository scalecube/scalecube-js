const { createMicroservice, ASYNC_MODEL_TYPES } = require('@scalecube/node');
const { retryRouterWithLogs } = require('./helpers/retryRouterWithLogs');

process.on('message', () => {
  const ms = createMicroservice({
    address: {
      protocol: 'ws',
      host: 'localhost',
      port: 6114,
      path: '',
    },
    seedAddress: {
      protocol: 'ws',
      host: 'localhost',
      port: 6111,
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

  try {
    person
      .requestGreeting()
      .then((response) => {
        console.log(`\nour distributed environment response with: `, response);
      })
      .catch((e) => {
        console.error('service not available', e.message);
      });
  } catch (e) {
    console.warn('catch error', e.message);
  }
});
