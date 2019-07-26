importScripts('http://localhost:8000/packages/scalecube-microservice/dist/index.js');
importScripts('./definitions.js');
importScripts('./reactiveStream.js');

const ms = sc.createMicroservice({
  services: [
    {
      reference: reactiveStreamExample,
      definition: definitions.remoteServiceDefinition2,
    },
  ],
  address: 'ms2',
  seedAddress: 'ms1',
});

const { awaitProxyName, awaitProxyName3 } = ms.createProxies({
  proxies: [
    {
      serviceDefinition: definitions.remoteServiceDefinition,
      proxyName: 'awaitProxyName',
    },
    {
      serviceDefinition: definitions.remoteServiceDefinition3,
      proxyName: 'awaitProxyName3',
    },
  ],
  isAsync: true,
});

awaitProxyName.then(({ proxy: serviceNameProxy }) => {
  console.log(`webworker 2 - awaitProxyName is ready: `);
  serviceNameProxy
    .getInterval(7000)
    .subscribe(
      (res) => console.log(`webworker 2 - awaitProxyName resolve every 7000 ms: ${res}`),
      (error) => console.log(error.message)
    );
});

awaitProxyName3.then(({ proxy: serviceNameProxy }) => {
  console.log(`webworker 2 - awaitProxyName3 is ready: `);
  serviceNameProxy
    .getInterval(5000)
    .subscribe(
      (res) => console.log(`webworker 2 - awaitProxyName3 resolve every 5000 ms: ${res}`),
      (error) => console.log(error.message)
    );
});

setTimeout(() => {
  ms.destroy();
}, 60 * 0.5 * 1000);
