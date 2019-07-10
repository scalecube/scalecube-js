import { createMicroservice } from '@scalecube/scalecube-microservice';
import { MicroserviceApi } from '@scalecube/api';

import GreetingService, { greetingServiceDefinition } from './service/GreetingService';

const reference: MicroserviceApi.ServiceReference = new GreetingService();

const greetingService: MicroserviceApi.Service = {
  definition: greetingServiceDefinition,
  reference,
};

const ms = createMicroservice({ services: [greetingService] });
const greetingServiceProxy = ms.createProxy({
  serviceDefinition: greetingServiceDefinition,
});

greetingServiceProxy.hello('User').then((result: string) => {
  console.info('result from greeting service', result);
});

console.info('Microservices from @scalecube/scalecube-microservice', createMicroservice);
