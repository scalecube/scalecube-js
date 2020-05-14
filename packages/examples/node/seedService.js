const { createMicroservice, ASYNC_MODEL_TYPES } = require('@scalecube/node');

process.on('message', () => {
  createMicroservice({
    address: {
      protocol: 'ws',
      host: 'localhost',
      port: 6111,
      path: '',
    },
    debug: true,
  });
});
