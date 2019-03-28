import Microservices from '@scalecube/scalecube-microservice';
import GreetingService, { greetingServiceDefinition } from './service/GreetingService';
var greetingService = {
  definition: greetingServiceDefinition,
  reference: new GreetingService(),
};
var ms = Microservices.create({ services: [greetingService] });
var greetingServiceProxy = ms.createProxy({ serviceDefinition: greetingServiceDefinition });
greetingServiceProxy.hello('User').then(function(result) {
  console.info('result from greeting service', result);
});
console.info('Microservices from @scalecube/scalecube-microservice', Microservices);
