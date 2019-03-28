import { Microservices } from '@scalecube/scalecube-microservice';
import GreetingService, { greetingServiceDefinition } from './service/GreetingService';

const greetingService = {
  definition: greetingServiceDefinition,
  reference: new GreetingService(),
};

const ms = Microservices.create({ services: [greetingService] });
const greetingServiceProxy = ms.createProxy({ serviceDefinition: greetingServiceDefinition });
greetingServiceProxy.hello('User').then((result: string) => {
  console.info('result from greeting service', result);
});

console.info('Microservices from @scalecube/scalecube-microservice', Microservices);

const clusterWorker = new SharedWorker('../../scalecube-discovery/src/clustersWorker.js');
clusterWorker.port.start();

clusterWorker.port.postMessage('in test');
