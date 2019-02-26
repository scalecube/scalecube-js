import {
  hello,
  greet$,
  greetingServiceDefinitionHello,
  greetingServiceDefinitionGreet$,
} from '../mocks/GreetingServiceModule';
import { Microservices } from '../../src/Microservices/Microservices';
import { Service } from '../../src/api/public';
import GreetingService, { greetingServiceDefinition } from '../mocks/GreetingService';

describe('Test creating microservice from module', () => {
  const defaultUser = 'defaultUser';

  describe('Test using one serviceDefinition', () => {
    const greetingService1: Service = {
      definition: greetingServiceDefinition,
      reference: {
        hello,
        greet$,
      },
    };
    const ms = Microservices.create({
      services: [greetingService1],
    });

    const greetingServiceProxy = ms.createProxy<GreetingService>({
      serviceDefinition: greetingServiceDefinition,
    });

    it('Test promise', () => {
      return expect(greetingServiceProxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
    });

    it('Test observable', (done) => {
      greetingServiceProxy.greet$([defaultUser]).subscribe((response: string) => {
        expect(response).toEqual(`greetings ${defaultUser}`);
        done();
      });
    });
  });

  describe('Test using different serviceDefinition for each method', () => {
    const greetingService1: Service = {
      definition: greetingServiceDefinitionGreet$,
      reference: greet$,
    };
    const greetingService2: Service = {
      definition: greetingServiceDefinitionHello,
      reference: hello,
    };
    const ms = Microservices.create({
      services: [greetingService1, greetingService2],
    });

    it('Test promise', () => {
      const greetingServiceProxy = ms.createProxy({
        serviceDefinition: greetingServiceDefinitionHello,
      });
      return expect(greetingServiceProxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
    });

    it('Test observable', (done) => {
      const greetingServiceProxy = ms.createProxy({
        serviceDefinition: greetingServiceDefinitionGreet$,
      });
      greetingServiceProxy.greet$([defaultUser]).subscribe((response: string) => {
        expect(response).toEqual(`greetings ${defaultUser}`);
        done();
      });
    });
  });
});
