const { createMicroservice, ASYNC_MODEL_TYPES } = require('@scalecube/node');

process.on('message', () => {
  createMicroservice({
    address: {
      protocol: 'ws',
      host: 'localhost',
      port: 1000,
      path: '',
    },
    debug: true,
  });
});
