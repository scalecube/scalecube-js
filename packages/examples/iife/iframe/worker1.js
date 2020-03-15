importScripts('http://localhost:8000/packages/browser/dist/index.js');
importScripts('./definitions.js');

sc.createMicroservice({
  services: [
    {
      definition: definitions.remoteServiceDefinition4,
      reference: {
        ack4: () => Promise.resolve('ack'),
      },
    },
  ],
  address: 'worker',
  seedAddress: 'main',
});
