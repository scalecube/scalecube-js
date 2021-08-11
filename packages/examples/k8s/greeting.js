const { createMicroservice, ASYNC_MODEL_TYPES } = require('@scalecube/node');

console.log('seed', process.env.SEED);
console.log('address', process.env.ADDRESS);

createMicroservice({
  seedAddress: {
    protocol: 'ws',
    host: process.env.SEED,
    port: 7001,
    path: '',
  },
  address: {
    protocol: 'ws',
    host: process.env.ADDRESS,
    port: 7003,
    path: '',
  },
  services: [
    {
      reference: { hello: ({ name }) => Promise.resolve(`hello: ${name}`) },
      definition: {
        serviceName: 'HelloService',
        methods: {
          hello: {
            asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
          },
        },
      },
    },
  ],
  debug: true,
});
