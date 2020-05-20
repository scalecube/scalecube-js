const { createMicroservice } = require('@scalecube/node');

console.log('seed', process.env.SEED_SERVICE_HOST);
console.log('address', process.env.ADDRESS);

createMicroservice({
  address: {
    protocol: 'ws',
    host: process.env.ADDRESS,
    port: 8080,
    path: '',
  },
  debug: true,
});
