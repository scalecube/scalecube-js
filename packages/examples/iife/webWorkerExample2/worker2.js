importScripts('http://localhost:8000/packages/browser/dist/index.js');
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

const proxyName = ms.createProxy({ serviceDefinition: definitions.remoteServiceDefinition });
const proxyName3 = ms.createProxy({ serviceDefinition: definitions.remoteServiceDefinition3 });

proxyName.getInterval(7000).subscribe(
  (res) => console.log(`webworker 2 - awaitProxyName resolve every 7000 ms: ${res}`),
  (error) => console.log(error.message)
);

proxyName3.getInterval(5000).subscribe(
  (res) => console.log(`webworker 2 - awaitProxyName3 resolve every 5000 ms: ${res}`),
  (error) => console.log(error.message)
);

setTimeout(() => {
  ms.destroy();
}, 60 * 0.5 * 1000);
