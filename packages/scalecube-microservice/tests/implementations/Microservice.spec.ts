import {
  hello,
  greet$,
  empty,
  greetingServiceDefinitionHello,
  greetingServiceDefinitionGreet$,
} from '../mocks/GreetingServiceModule';
import Microservices, { ASYNC_MODEL_TYPES } from '../../src';
import { Service, ServiceDefinition } from '../../src/api';
import GreetingService, { greetingServiceDefinition } from '../mocks/GreetingService';
import GreetingService2, { greetingServiceDefinition2 } from '../mocks/GreetingService2';
import { getInvalidMethodReferenceError, getServiceIsNotValidError } from '../../src/helpers/constants';
import { getGlobalNamespace } from '../../src/helpers/utils';
import { ScalecubeGlobal } from '@scalecube/scalecube-discovery/lib/helpers/types';

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
      // move to 'register-service-tests.spec.ts'
      Scenario: Fail to register a service, reference does not match definition
        Given   a service with definition and reference
        |service          |definition               |reference  |
        |greetingService  |hello : RequestResponse  |           |
        # definition has a method that is not contained in the reference
        When    creating a Microservice with the service
        Then    exception will occur
        And     Invalid method reference for GreetingService/hello`, () => {
      const greetingService: Service = {
        definition: {
          serviceName: 'GreetingService',
          methods: {
            hello: {
              asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
            },
          },
        },
        reference: {},
      };
      expect.assertions(1);
      try {
        Microservices.create({ services: [greetingService] });
      } catch (error) {
        expect(error.message).toMatch(getInvalidMethodReferenceError('GreetingService/hello'));
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
      // move to 'register-service-tests.spec.ts'
      Scenario: Fail to register a service, method definition is a primitive
        Given   a service with definition and reference
        And     definition and reference comply with each other
        |service          |definition            |reference             |
        |greetingService  |hello: null           |                      |
        # reference has a method that is not a function
        When    creating a Microservice with the service
        Then    a Microservice will not be created
        And     exception will occur with service greetingService is not valid.
      `, () => {
        const greetingService: Service = {
          definition: {
            serviceName: 'greetingService',
            methods: {
              // @ts-ignore
              hello: null,
            },
          },
          reference: {},
        };
        expect.assertions(1);
        try {
          Microservices.create({ services: [greetingService] });
        } catch (error) {
          expect(error.message).toMatch(getServiceIsNotValidError(greetingService.definition.serviceName));
        }
      });

      test(`
      // move to 'register-service-tests.spec.ts'
      Scenario: Fail to register a service, asyncModel invalid
        Given   a service with definition and reference
        And     definition and reference comply with each other
        |service          |definition            |reference             |
        |greetingService  |hello: null           |                      |
        # reference has a method that is not a function
        When    creating a Microservice with the service
        Then    a Microservice will not be created
        And     exception will occur with service greetingService is not valid.
      
      // move to 'register-service-tests.spec.ts'
      Scenario: Fail to register a service, (silent failing)
        Given   a service with definition and reference
        |service          |definition            |reference  |
        |greetingService  |             |hello: RequestResponse|
        |                 |greet$: RequestStream |greet$: RequestStream |
        # reference has a method that is not contained in the definition
        When    creating a Microservice with the service
        Then    Microservice will successfully created
        But Microservice instance won't contain hello method
      `, () => {
        const greetingService: Service = {
          definition: {
            serviceName: 'greetingService',
            methods: {
              hello: {
                // @ts-ignore
                asyncModel: null,
              },
            },
          },
          reference: {},
        };
        expect.assertions(1);
        try {
          Microservices.create({ services: [greetingService] });
        } catch (error) {
          expect(error.message).toMatch(getServiceIsNotValidError(greetingService.definition.serviceName));
        }
      });

      test(`
      // move to 'proxy-tests.spec.ts'
      Scenario: Invoke registered service from proxy (RequestResponse)
        Given   a service with definition and reference
        And     definition and reference comply with each other
        |service          |definition            |reference             |
        |greetingService  |hello: RequestResponse|hello: RequestResponse|
        |                 |greet$: RequestStream |greet$: RequestStream | 
        When    Microservice is created
        And     greetingServiceProxy is created from the Microservice
        And     greetingServiceProxy invokes a RequestResponse method
        Then    successful RequestResponse is received
      `, () => {
        return expect(greetingServiceProxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
      });

      test(`
      // move to 'proxy-tests.spec.ts'
      Scenario: Invoke registered service from proxy (RequestStream)
        Given   a service with definition and reference
        And     definition and reference comply with each other
        |service          |definition            |reference             |
        |greetingService  |hello: RequestResponse|hello: RequestResponse|
        |                 |greet$: RequestStream |greet$: RequestStream |      
        When    Microservice is created
        And     greetingServiceProxy is created from the Microservice
        And     subscribe to greetingServiceProxy RequestStream's method
        Then    successful RequestStream is emitted 
      `, (done) => {
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

      test(`
      // move to 'proxy-tests.spec.ts'
      Scenario: Invoke registered serviceS from proxy (RequestResponse)
        Given   a service with definition and reference
        And     definition and reference comply with each other
        |service          |definition            |reference             |
        |greetingService1 |greet$: RequestStream |greet$: RequestStream |
        |greetingService2 |hello: RequestResponse|hello: RequestResponse|
        When    Microservice is created
        And     Proxy is created from the Microservice
        And     proxy invokes a RequestResponse method
        Then    successful RequestResponse is received
      `, () => {
        const greetingServiceProxy = ms.createProxy({
          serviceDefinition: greetingServiceDefinitionHello,
        });
        return expect(greetingServiceProxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
      });

      test(`
      // move to 'proxy-tests.spec.ts'
      Scenario: Subscribe to a service from proxy (RequestStream)
        Given   a service with definition and reference
        And     definition and reference comply with each other
        |service          |definition            |reference             |
        |greetingService1 |greet$: RequestStream |greet$: RequestStream |
        |greetingService2 |hello: RequestResponse|hello: RequestResponse|      
        When    Microservice is created
        And     Proxy is created from the Microservice
        And     subscribe to proxy RequestStream method
        Then    successful RequestStream is emitted 
      `, (done) => {
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
    test(`
      // move to 'discovery-tests.spec.ts'
      Scenario: Invoke remote service 
        Given   two valid Microservices under the same seedAddress
        | Microservice | reference| definition  |
        | ms1          | s1       |d1           |
        | ms2          | s2       |d2           | 
        When    creating a proxy to ms1 with definition of d2
        And     proxy invokes s2
        Then    remoteCall is performed and valid response is received
    `, () => {
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

    test(`
      // move to 'proxy-tests.spec.ts'
      Scenario: Fail to invoke a remote service 
        Given   two valid Microservices under the same seedAddress
        | Microservice | reference| definition  |
        | ms1          | s1       |d1           |
        | ms2          | s2       |d2           | 
        When    creating a proxy to ms1 with definition of d3
        And     remoteCall is performed and proxy tries to invoke s2
        Then    exception will occur
        And     a relevant message will be received
    `, () => {
      expect(true).toBe(false);
    });
  });
});
