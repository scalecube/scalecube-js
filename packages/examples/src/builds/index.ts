import Microservices, { Api } from '@scalecube/scalecube-microservice';
import GreetingService, { greetingServiceDefinition } from './service/GreetingService';

const reference: Api.ServiceReference = new GreetingService();

const greetingService: Api.Service = {
  definition: greetingServiceDefinition,
  reference,
};

const ms = Microservices.create({ services: [greetingService] });
const greetingServiceProxy = ms.createProxy({
  serviceDefinition: greetingServiceDefinition,
});

greetingServiceProxy.hello('User').then((result: string) => {
  console.info('result from greeting service', result);
});

console.info('Microservices from @scalecube/scalecube-microservice', Microservices);
