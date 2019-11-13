const { createMicroservice, ASYNC_MODEL_TYPES } = require('@scalecube/scalecube-microservice');
const { TransportNodeJS } = require('@scalecube/transport-nodejs');
const { joinCluster } = require('@scalecube/cluster-nodejs');

console.log('process.env.whoAmI', process.env.whoAmI);
console.log('process.env.seed', process.env.seed);

const [myHost, myPort] = process.env.whoAmI.split(':');
const address = {
  protocol: 'ws',
  host: myHost,
  port: Number(myPort),
  path: '',
};

const definition = {
  serviceName: 'HelloService',
  methods: {
    hello: {
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
    },
  },
};

let seedAddress;
let services = [];
if (process.env.seed) {
  const [seedHost, seedPort] = process.env.seed.split(':');
  seedAddress = {
    protocol: 'ws',
    host: seedHost,
    port: Number(seedPort),
    path: '',
  };
}

if (myPort === '7000') {
  services = [
    {
      reference: { hello: (data) => Promise.resolve('hello') },
      definition,
    },
  ];
}

console.log(address, seedAddress);
const proxy = createMicroservice({
  cluster: joinCluster,
  transport: TransportNodeJS,
  address,
  seedAddress,
  services,
  debug: true,
}).createProxy({
  serviceDefinition: definition,
});

console.log(`${process.env.whoAmI} try to call hello`);
proxy
  .hello('test')
  .then(console.log)
  .catch(console.error);
