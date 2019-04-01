import {
  hello,
  greet$,
  empty,
  greetingServiceDefinitionHello,
  greetingServiceDefinitionGreet$,
} from '../mocks/GreetingServiceModule';
import { Microservices, ASYNC_MODEL_TYPES } from '../../src';
import { Service, ServiceDefinition } from '../../src/api';
import GreetingService, { greetingServiceDefinition } from '../mocks/GreetingService';
import GreetingService2, { greetingServiceDefinition2 } from '../mocks/GreetingService2';
import { getInvalidMethodReferenceError } from '../../src/helpers/constants';
import { ScalecubeGlobal } from '@scalecube/scalecube-discovery/src/helpers/types';
import { getGlobalNamespace } from '../../src/helpers/utils';

describe('Test the creation of Microservice', () => {
  const defaultUser = 'defaultUser';

  const definitionWithWrongMethodReference: ServiceDefinition = {
    ...greetingServiceDefinition,
    methods: {
      ...greetingServiceDefinition.methods,
      empty: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      },
    },
  };

  beforeEach(() => {
    getGlobalNamespace().scalecube = {} as ScalecubeGlobal;
  });

  describe('Test creating microservice from function constructor', () => {
    test(`
      Scenario: Fail to register a service
      Given     a service with definition and reference
      And       definiton has a method that is not contained in the reference
      When      creating a Microservice with the service
      Then      exception will occur
      And       a relevant message will be received`, () => {
      const greetingService: Service = {
        definition: definitionWithWrongMethodReference,
        reference: new GreetingService(),
      };
      expect.assertions(1);
      try {
        Microservices.create({ services: [greetingService] });
      } catch (error) {
        expect(error.message).toMatch(getInvalidMethodReferenceError('GreetingService/empty'));
      }
    });
  });

  describe('Test creating microservice from module', () => {
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

      test(`
      Scenario: Fail to register a service
      Given     a service with definition and reference
      And       definiton and reference comply with each other
      But       reference has a method that is not a function
      When      creating a Microservice with the service
      Then      exception will occur
      And       a relevant message will be received`, () => {
        const greetingService: Service = {
          definition: definitionWithWrongMethodReference,
          reference: { hello, greet$, empty },
        };
        expect.assertions(1);
        try {
          Microservices.create({ services: [greetingService] });
        } catch (error) {
          expect(error.message).toMatch(getInvalidMethodReferenceError('GreetingService/empty'));
        }
      });

      test('Test REQUEST_RESPONSE', () => {
        return expect(greetingServiceProxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
      });

      test('Test observable', (done) => {
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

      test('Test REQUEST_RESPONSE', () => {
        const greetingServiceProxy = ms.createProxy({
          serviceDefinition: greetingServiceDefinitionHello,
        });
        return expect(greetingServiceProxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
      });

      test('Test observable', (done) => {
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

  describe('Test Discovery', () => {
    test('Access endpoint from other discovery with remoteCall', () => {
      expect.assertions(1);

      const ms1SeedAddress = 'cluster1';
      const greetingService1: Service = {
        definition: greetingServiceDefinition,
        reference: new GreetingService(),
      };
      const greetingService2: Service = {
        definition: greetingServiceDefinition2,
        reference: new GreetingService2(),
      };

      const ms1 = Microservices.create({ services: [greetingService1], seedAddress: ms1SeedAddress });
      Microservices.create({ services: [greetingService2], seedAddress: ms1SeedAddress });

      const proxy1 = ms1.createProxy({ serviceDefinition: greetingServiceDefinition2 });
      return expect(proxy1.hello(defaultUser)).resolves.toEqual({}); // will fail after implementing remoteCall
    });
  });
});
