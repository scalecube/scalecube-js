importScripts('http://localhost:8000/packages/scalecube-microservice/dist/index.js');
importScripts('./definitions.js');
importScripts('./bubbleSortService.js');

sc.createMicroservice({
  services: [
    {
      reference: remoteBubbleSortService,
      definition: definitions.remoteServiceDefinition,
    },
  ],
  address: 'worker',
});

sc.createMicroservice({
  services: [
    {
      reference: remoteBubbleSortService,
      definition: definitions.remoteServiceDefinition3,
    },
  ],
  address: 'worker3',
  seedAddress: 'worker',
});

const ms = sc.createMicroservice({
  address: 'empty',
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

// addEventListener('message', (ev)=>{
//   if (ev.data.detail.type === "rsocket-events-open-connection"){
//     console.log("rsocket-events-open-connection",ev)
//   }
// })

awaitProxyName.then(({ proxy: serviceNameProxy }) => {
  console.log('worker - service ready');
  serviceNameProxy.bubbleSortTime().then((res) => console.log('wo', res));
});
