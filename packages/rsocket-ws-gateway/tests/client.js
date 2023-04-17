const createGatewayProxy = require('@scalecube/rsocket-ws-gateway-client/dist/createGatewayProxy.js')
  .createGatewayProxy;

const definition = {
  serviceName: 'serviceA',
  methods: {
    methodG: { asyncModel: 'requestStream' },
  },
};
console.log('hey');
(async () => {
  console.log('hey2');
  const proxy = await createGatewayProxy(`ws://localhost:8480`, definition).catch(console.log);

  console.log('hey3');
  proxy.methodG().subscribe(() => process.exit());
})();
