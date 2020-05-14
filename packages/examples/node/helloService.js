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
      port: 6112,
      path: '',
    },
    seedAddress: {
      protocol: 'ws',
      host: 'localhost',
      port: 6111,
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
