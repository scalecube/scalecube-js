importScripts('http://localhost:8000/packages/scalecube-microservice/dist/index.js');
importScripts('./definitions.js');
importScripts('./bubbleSortService.js');

const ms = sc.createMicroservice({
  services: [
    {
      reference: remoteBubbleSortService,
      definition: definitions.remoteServiceDefinition2,
    },
  ],
  address: 'worker2',
  seedAddress: 'worker',
});

const { awaitProxyName } = ms.createProxies({
  proxies: [
    {
      serviceDefinition: definitions.remoteServiceDefinition,
      proxyName: 'awaitProxyName',
    },
  ],
  isAsync: true,
});

awaitProxyName.then(({ proxy: serviceNameProxy }) => {
  console.log('worker222 - service ready');
  serviceNameProxy.bubbleSortTime().then((res) => console.log('wo2222', res));
});
