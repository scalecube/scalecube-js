import { createMicroservice } from '@scalecube/scalecube-microservice';
import { MicroserviceApi } from '@scalecube/api';
import { retryRouter } from '@scalecube/routers';
import GreetingService, { greetingServiceDefinition } from './service/GreetingService';

const reference: MicroserviceApi.ServiceReference = new GreetingService();

const greetingService: MicroserviceApi.Service = {
  definition: greetingServiceDefinition,
  reference,
};

const ms = createMicroservice({ address: 'localMS', seedAddress: 'seed', debug: true });

const proxy = ms.createProxy({
  serviceDefinition: greetingServiceDefinition,
  router: retryRouter({ period: 10 }),
});

proxy.hello('User').then((result: string) => {
  console.info('result from greeting service - hello', result);
});

proxy.greet$(['User1', 'User2', 'User3']).subscribe((result: string) => {
  console.info('result from greeting service - greet$', result);
});

createMicroservice({ services: [greetingService], address: 'seed', debug: true });
