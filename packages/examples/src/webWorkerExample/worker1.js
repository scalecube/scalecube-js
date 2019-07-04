importScripts('http://localhost:8000/packages/scalecube-microservice/dist/index.js');
importScripts('./definitions.js');
importScripts('./bubbleSortService.js');

sc.Microservices.create({
  services: [
    {
      reference: remoteBubbleSortService,
      definition: definitions.remoteServiceDefinition,
    },
  ],
  address: 'worker',
  seedAddress: 'main',
});
