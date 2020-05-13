const { createMicroservice, ASYNC_MODEL_TYPES } = require('@scalecube/node');

const definition = {
  serviceName: 'HelloService',
  methods: {
    hello: {
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
    },
  },
};

process.on('message', () => {
  createMicroservice({
    address: {
      protocol: 'ws',
      host: 'localhost',
      port: 2000,
      path: '',
    },
    seedAddress: {
      protocol: 'ws',
      host: 'localhost',
      port: 1000,
      path: '',
    },
    services: [
      {
        reference: { hello: (data) => Promise.resolve(`hello ${data}`) },
        definition,
      },
    ],
  });
});
