import { Microservices } from './Microservices';
import { Service } from '../api/public';
import { greetingServiceDefinition } from '../../__mocks__/GreetingService';
import GreetingService from '../../__mocks__/GreetingService';

describe('Microservices Testing', () => {
  const greetingService1: Service = {
    definition: greetingServiceDefinition,
    implementation: new GreetingService(),
  };
  const greetingService2: Service = {
    definition: greetingServiceDefinition,
    implementation: new GreetingService(),
  };

  const microserviceOptions = {
    services: [greetingService1, greetingService2],
  };

  const microservice = Microservices.create(microserviceOptions);

  it('Test Microservice.create({ services }: MicroserviceOptions): Microservice', () => {
    expect(microservice.createProxy).toBeDefined();
    expect(microservice.createDispatcher).toBeDefined();
  });
});
