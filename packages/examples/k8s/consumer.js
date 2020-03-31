const { createMicroservice, ASYNC_MODEL_TYPES } = require('@scalecube/node');

console.log('seed', process.env.SEED);
console.log('address', process.env.ADDRESS);

const definition = {
  serviceName: 'HelloService',
  methods: {
    hello: {
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
    },
  },
};

const proxy = createMicroservice({
  seedAddress: {
    protocol: 'ws',
    host: process.env.SEED,
    port: 8080,
    path: '',
  },
  address: {
    protocol: 'ws',
    host: process.env.ADDRESS,
    port: 8080,
    path: '',
  },
  debug: true,
}).createProxy({
  serviceDefinition: definition,
});

setInterval(() => {
  proxy
    .hello('test')
    .then(console.log)
    .catch(console.error);
}, 10000);
