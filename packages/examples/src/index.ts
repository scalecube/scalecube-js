import { Microservices } from '@scalecube/scalecube-microservice'
import GreetingService, { greetingServiceDefinition } from './service/GreetingService'

const greetingService = {
  definition: greetingServiceDefinition,
  reference: new GreetingService(),
};

const ms = Microservices.create({ services: [greetingService] });
const greetingServiceProxy = ms.createProxy({ serviceDefinition: greetingServiceDefinition });
greetingServiceProxy.hello('User').then((result: string) => {
  console.log('result from greeting service', result);
});

console.log('Microservices', Microservices);
