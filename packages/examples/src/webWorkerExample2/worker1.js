// importScripts('http://localhost:8000/packages/scalecube-microservice/dist/index.js');
// importScripts('./definitions.js');
// importScripts('./reactiveStream.js');
//
// const ms1 = sc.createMicroservice({
//   services: [
//     {
//       reference: reactiveStreamExample,
//       definition: definitions.remoteServiceDefinition,
//     },
//   ],
//   address: 'ms1',
// });
//
// const ms2 = sc.createMicroservice({
//   services: [
//     {
//       reference: reactiveStreamExample,
//       definition: definitions.remoteServiceDefinition3,
//     },
//   ],
//   address: 'ms3',
//   seedAddress: 'ms1',
// });
//
// const ms3 = sc.createMicroservice({
//   address: 'ms4',
//   seedAddress: 'ms1',
// });
//
// const { awaitProxyName, awaitProxyName3 } = ms3.createProxies({
//   proxies: [
//     {
//       serviceDefinition: definitions.remoteServiceDefinition,
//       proxyName: 'awaitProxyName',
//     },
//     {
//       serviceDefinition: definitions.remoteServiceDefinition3,
//       proxyName: 'awaitProxyName3',
//     },
//   ],
//   isAsync: true,
// });
//
// awaitProxyName.then(({ proxy: serviceNameProxy }) => {
//   console.log(`webworker 1 - awaitProxyName is ready: `);
//   serviceNameProxy
//     .getInterval(1000)
//     .subscribe(
//       (res) => console.log(`webworker 1 - awaitProxyName is resolve every 1000ms: ${res}`),
//       (error) => console.log(error.message)
//     );
// });
//
// awaitProxyName3.then(({ proxy: serviceNameProxy }) => {
//   console.log(`webworker 1 - awaitProxyName3 is ready: `);
//   serviceNameProxy
//     .getInterval(9000)
//     .subscribe(
//       (res) => console.log(`webworker 1 - awaitProxyName3 is resolve every 9000ms: ${res}`),
//       (error) => console.log(error.message)
//     );
// });
//
// setTimeout(() => {
//   ms1.destroy();
//   ms2.destroy();
//   ms3.destroy();
// }, 60 * 0.5 * 1000);
