importScripts('http://localhost:8000/packages/scalecube-microservice/dist/index.js');
importScripts('./definitions.js');
importScripts('./reactiveStream.js');

sc.createMicroservice({
  services: [
    {
      reference: remoteBubbleSortService,
      definition: definitions.remoteServiceDefinition2,
    },
  ],
  address: 'worker2',
  seedAddress: 'main',
});
