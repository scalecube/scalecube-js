import { isObservable } from 'rxjs';
import GreetingService, { greetingServiceDefinition } from '../mocks/GreetingService';
import GreetingService2, { greetingServiceDefinition2 } from '../mocks/GreetingService2';
import GreetingServiceWithStatic, { greetingServiceWithStaticDefinition } from '../mocks/GreetingServiceWithStatic';
import Microservices, { ASYNC_MODEL_TYPES } from '../../src';
import { defaultRouter } from '../../src/Routers/default';
import { ProxyOptions, Service, ServiceDefinition } from '../../src/api';
import AsyncModel from '../../src/api/AsyncModel';
import { expectWithFailNow } from '../helpers/utils';
import {
  getAsyncModelMissmatch,
  getServiceIsNotValidError,
  getServiceMethodIsMissingError,
  SERVICE_DEFINITION_NOT_PROVIDED,
  SERVICE_NAME_NOT_PROVIDED,
} from '../../src/helpers/constants';

describe('Test creating proxy from microservice', () => {
  test(`
    // move to 'successful-invoke-proxy.spec.ts'
    Scenario: Create a proxy from Microservice 
      Given   a service with definition and reference
      And     definition and reference comply with each other
      |service          |definition            |reference  |
      |greetingService  |hello: RequestResponse|hello: RequestResponse|
      |                 |greet$: RequestStream |greet$: RequestStream | 
      When    creating a Microservice with the service
      Then    greetingServiceProxy is created from the Microservice
      `, () => {
    expect(true).toBe(false);
  });
  console.warn = jest.fn(); // disable validation logs while doing this test
  console.error = jest.fn(); // disable validation logs while doing this test

  const defaultUser = 'defaultUser';

  const definitionWithWrongAsyncModel: ServiceDefinition = {
    ...greetingServiceDefinition,
    methods: {
      ...greetingServiceDefinition.methods,
      hello: {
        asyncModel: 'wrongAsyncModel' as AsyncModel,
      },
    },
  };

  const missMatchDefinition = {
    ...greetingServiceDefinition,
    methods: {
      ...greetingServiceDefinition.methods,
      hello: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      },
      greet$: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      },
    },
  };

  const greetingService: Service = {
    definition: greetingServiceDefinition,
    reference: new GreetingService(),
  };

  const greetingService2: Service = {
    definition: greetingServiceDefinition2,
    reference: new GreetingService2(),
  };

  const greetingServiceWithStatic: Service = {
    definition: greetingServiceWithStaticDefinition,
    reference: new GreetingServiceWithStatic(),
  };

  const prepareScalecubeForGreetingService = (
    { serviceDefinition = greetingServiceDefinition }: { serviceDefinition: ServiceDefinition } = {} as ProxyOptions
  ) => {
    const ms = Microservices.create({ services: [greetingService] });
    return ms.createProxy({ serviceDefinition });
  };

  test(`
    # Invoke method that is defined in the serviceDefinition (requestResponse asyncModel)
    // move to 'successful-invoke-proxy.spec.ts'
    Scenario: Invoke a method that is defined in the serviceDefinition (requestResponse)
      Given:  Given a Microservice
      And     definition and reference comply with each other
      |service          |definition            |reference  |
      |greetingService  |hello: RequestResponse|hello: RequestResponse|
      |                 |greet$: RequestStream |greet$: RequestStream |
      When    proxy is created from the Microservice
      And     proxy tries to invoke method 'hello: RequestResponse' from serviceDefinition
      Then    greetingServiceProxy will be invoked from the Microservice
    `, () => {
    const greetingServiceProxy = prepareScalecubeForGreetingService();
    return expect(greetingServiceProxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
  });

  test(`
    # Invoke method that is defined in the serviceDefinition (requestStream asyncModel)
    //// move to 'successful-invoke-proxy.spec.ts'
    Scenario: Invoke a method that is defined in the serviceDefinition (requestResponse)
      Given:  Given a Microservice
      And     definition and reference comply with each other
      |service          |definition            |reference  |
      |greetingService  |hello: RequestResponse|hello: RequestResponse|
      |                 |greet$: RequestStream |greet$: RequestStream |
      When    proxy is created from the Microservice
      And     proxy tries to invoke method 'hello: RequestStream' from serviceDefinition
      Then    greetingServiceProxy will be invoked from the Microservice
    `, (done) => {
    const greetingServiceProxy = prepareScalecubeForGreetingService();

    expect.assertions(4);
    let i = 0;
    greetingServiceProxy.greet$(['Hello', 'Hey', 'Yo']).subscribe((item: string) => {
      switch (i) {
        case 0:
          expectWithFailNow(() => expect(item).toBe('greetings Hello'), done);
          break;
        case 1:
          expectWithFailNow(() => expect(item).toBe('greetings Hey'), done);
          break;
        case 2:
          expectWithFailNow(() => expect(item).toBe('greetings Yo'), done);
          break;
        default:
          expect(0).toBe(1);
          break;
      }
      i = i + 1;
    });

    setTimeout(() => {
      expectWithFailNow(() => expect(i).toBe(3), done);
      done();
    }, 1000);
  });

  test(`
    // move to 'failed-invoke-proxy.spec.ts'
    Scenario: Fail to create proxy, missing serviceDefinition
      Given   a Microservice
      |service          |definition            |reference             |
      |greetingService  |hello: RequestResponse|hello: RequestResponse|
      |                 |greet$: RequestStream |greet$: RequestStream |
      When    proxy is created from the Microservice
      And     Definition is not defined for createProxy
      Then    greetingServiceProxy will NOT be created from the Microservice
      And     invalid error (serviceDefinition) is not defined
      `, () => {
    const ms = Microservices.create({ services: [greetingService] });
    try {
      // @ts-ignore-next-line
      ms.createProxy({});
    } catch (e) {
      expect(e.message).toEqual(SERVICE_DEFINITION_NOT_PROVIDED);
    }
  });

  test(`
    // move to 'failed-invoke-proxy.spec.ts'
    Scenario: Fail to create a proxy, missing serviceName in serviceDefinition
      Given   a Microservice
      |service          |definition            |reference             |
      |greetingService  |hello: RequestResponse|hello: RequestResponse|
      |                 |greet$: RequestStream |greet$: RequestStream |
      When    proxy is created by a Microservice
      And     serviceName is missing in the serviceDefinition
      |serviceName      |methods               |
      |                 |hello: RequestResponse|
      Then    greetingServiceProxy will NOT be created from the Microservice
      And     invalid error (serviceDefinition.serviceName) is not defined 
    `, () => {
    try {
      // @ts-ignore-next-line
      prepareScalecubeForGreetingService({ serviceDefinition: { methods: { ...greetingServiceDefinition.methods } } });
    } catch (e) {
      expect(e.message).toEqual(SERVICE_NAME_NOT_PROVIDED);
    }
  });

  test(`
    // move to 'failed-invoke-proxy.spec.ts'
    Scenario: Fail to create a proxy, missing a methods serviceDefinition
      Given   a Microservice
      |service          |definition            |reference             |
      |greetingService  |hello: RequestResponse|hello: RequestResponse|
      |                 |greet$: RequestStream |greet$: RequestStream |
      When    proxy is created by a Microservice
      And     methods are missing in the serviceDefinition
      |serviceName      |methods               |
      |greetingService  |                      |
      Then    greetingServiceProxy will NOT be created from the Microservice
      And     invalid error service (serviceName) is not valid.      
    `, () => {
    try {
      // @ts-ignore-next-line
      prepareScalecubeForGreetingService({ serviceDefinition: { serviceName: greetingServiceDefinition.serviceName } });
    } catch (e) {
      expect(e.message).toEqual(getServiceIsNotValidError(greetingServiceDefinition.serviceName));
    }
  });

  test(`
    // move to 'failed-invoke-proxy.spec.ts'
    Scenario: Proxy failed to invoke a method, missing a method serviceDefinition
      Given   a Microservice
      |service          |definition            |reference             |
      |greetingService  |hello: RequestResponse|hello: RequestResponse|
      |                 |greet$: RequestStream |greet$: RequestStream |
      And     proxy is created by a Microservice
      |serviceName      |methods               |
      |greetingService  |hello: RequestResponse|
      When    Proxy tries to invoke method that does not exist in the serviceDefinition
      |method: fakeHello |
      Then    an error will occur service method 'fakeHello' missing in the serviceDefinition
    `, () => {
    const greetingServiceProxy = prepareScalecubeForGreetingService();
    try {
      greetingServiceProxy.fakeHello();
    } catch (e) {
      expect(e.message).toEqual(getServiceMethodIsMissingError('fakeHello'));
    }
  });

  test(`
    # Throw error message when creating proxy with invalid serviceDefinition
    // move to 'failed-invoke-proxy.spec.ts'
    Scenario: Proxy failed to invoke a method, invalid serviceDefinition
      Given   a Microservice
      |service          |definition            |reference             |
      |greetingService  |hello: RequestResponse|hello: RequestResponse|
      |                 |greet$: RequestStream |greet$: RequestStream |
      And     proxy is created by a Microservice
      |serviceName      |methods               |
      |greetingService  |hello: RequestResponse|
      When    Proxy tries to invoke an invalid method from serviceDefinition
      |method: getServiceIsNotValidError |
      Then    an error will occur service 'getServiceIsNotValidError' is not valid
    `, () => {
    const ms = Microservices.create({ services: [greetingService] });
    try {
      ms.createProxy({
        // @ts-ignore-next-line
        serviceDefinition: definitionWithWrongAsyncModel,
        router: defaultRouter,
      });
    } catch (e) {
      expect(e.message).toEqual(getServiceIsNotValidError('GreetingService'));
    }
  });

  test(`
    # Throw error message when proxy serviceDefinition does not match microservice serviceDefinition - observable
    // move to 'failed-invoke-proxy.spec.ts'
    Scenario: Proxy failed to invoke a method, microService and proxy serviceDefinition mismatch - observable
      Given   a Microservice
      |service          |definition            |reference             |
      |greetingService  |hello: RequestResponse|hello: RequestResponse|
      |                 |greet$: RequestStream |greet$: RequestStream |
      And     proxy created by a Microservice
      |serviceName      |methods               |
      |greetingService  |greet$: RequestStream2|
      When    Proxy tries to invoke a method from serviceDefinition
      |method: RequestStream2 |
      Then    an error will occur asyncModel miss match, expect (RequestStream), but received (RequestStream2)  
  `, (done) => {
    const greetingServiceMissMatchAsyncModel = prepareScalecubeForGreetingService({
      serviceDefinition: missMatchDefinition,
    });

    greetingServiceMissMatchAsyncModel.hello(defaultUser).subscribe({
      error: (error: Error) => {
        expectWithFailNow(
          () => expect(error.message).toMatch(getAsyncModelMissmatch('RequestStream', 'RequestResponse')),
          done
        );
        done();
      },
    });
  });

  test(`
    # Throw error message when proxy serviceDefinition does not match microservice serviceDefinition - REQUEST_RESPONSE
    // move to 'failed-invoke-proxy.spec.ts'
    Scenario: Proxy failed to invoke a method, microService and proxy serviceDefinition mismatch - REQUEST_RESPONSE
      Given   a Microservice
      |service          |definition            |reference             |
      |greetingService  |hello: RequestResponse|hello: RequestResponse|
      |                 |greet$: RequestStream |greet$: RequestStream |
      And     proxy created by a Microservice
      |serviceName      |methods                |
      |greetingService  |hello: RequestResponse2|
      When    Proxy tries to invoke a method from serviceDefinition
      |method: RequestResponse2 |
      Then    an error will occur asyncModel miss match, expect (RequestResponse), but received (RequestResponse2)
  `, (done) => {
    const greetingServiceMissMatchAsyncModel = prepareScalecubeForGreetingService({
      serviceDefinition: missMatchDefinition,
    });

    greetingServiceMissMatchAsyncModel.greet$([defaultUser]).catch((error: any) => {
      expectWithFailNow(
        () => expect(error.message).toMatch(getAsyncModelMissmatch('RequestResponse', 'RequestStream')),
        done
      );
      done();
    });
  });

  test(`
    # Proxies for two different services work correctly
    // move to 'successful-invoke-proxy.spec.ts'
    Scenario: Proxy created with two different services will work
      Given   a Microservice
      |service          |definition            |reference             |
      |greetingService  |hello: RequestResponse|hello: RequestResponse|
      |                 |greet$: RequestStream |greet$: RequestStream |
      |greetingService2 |hello: RequestResponse|hello: RequestResponse|
      |                 |greet$: RequestStream |greet$: RequestStream |
      And     proxy created by a Microservice
      |serviceName      |methods                |
      |greetingService  |hello: RequestResponse |
      |                 |greet$: RequestStream
      |greetingService2 |hello: RequestResponse2|
      When    Proxy tries to invoke a method from serviceDefinition
      |method: RequestResponse |
      Then    greetingServiceProxy is created from the Microservice
    `, () => {
    expect.assertions(2);
    const ms = Microservices.create({ services: [greetingService, greetingService2] });
    const greetingServiceProxy = ms.createProxy({
      serviceDefinition: greetingServiceDefinition,
    });
    const greetingService2Proxy = ms.createProxy({
      serviceDefinition: greetingServiceDefinition2,
    });

    expect.assertions(2);
    return greetingServiceProxy
      .hello(defaultUser)
      .then((greeting1Response: GreetingService) => expect(greeting1Response).toEqual(`Hello ${defaultUser}`))
      .then(() =>
        greetingService2Proxy
          .hello(defaultUser)
          .then((greeting2Response: GreetingService2) => expect(greeting2Response).toEqual(`hey ${defaultUser}`))
      );
  });

  test(`
    # The inner logic of throwing errors in method implementation is saved (requestResponse asyncModel)
    // move to 'failed-async-model.spec.ts'
    Scenario: An error occurs after method 'requestResponse asyncModel' invokes, error received.
      Given   a Microservice
      |service              |definition            |reference             |
      |greetingService      |hello: RequestResponse|hello: RequestResponse|
      |                     |greet$: RequestStream |greet$: RequestStream |
      And     proxy is created by a Microservice
      |serviceName          |methods               |
      |greetingServiceProxy |hello: RequestResponse|
      When    greetingService reject method 'requestResponse'
      Then    invalid response is received Error('please provide user to greet')
  
  `, () => {
    const greetingServiceProxy = prepareScalecubeForGreetingService();
    expect.assertions(1);
    return expect(greetingServiceProxy.hello()).rejects.toEqual(new Error('please provide user to greet'));
  });

  test(`
    # The inner logic of throwing errors in method implementation is saved (requestStream asyncModel)
    // move to 'failed-async-model.spec.ts'
    Scenario: An error occurs after method 'requestStream asyncModel' invokes, error received.
      Given   a Microservice
      |service              |definition            |reference             |
      |greetingService      |hello: RequestResponse|hello: RequestResponse|
      |                     |greet$: RequestStream |greet$: RequestStream |
      And     proxy is created by a Microservice
      |serviceName          |methods               |
      |greetingServiceProxy |greet$: RequestStream |
      When    greetingService reject method 'requestStream'
      Then    invalid response is received Error('please provide Array of greetings')
    `, (done) => {
    const greetingServiceProxy = prepareScalecubeForGreetingService();
    expect.assertions(1);
    greetingServiceProxy.greet$().subscribe(
      () => expect(0).toEqual(1),
      (err: Error) => {
        expectWithFailNow(() => expect(err).toEqual(new Error('please provide Array of greetings')), done);
        done();
      }
    );
  });

  test(`
    # Proxy does not convert the asyncModel to some other type
    // move to 'successful-async-model.spec.ts'
    Scenario: Proxy does not convert type in the asyncModel, promise getting response.
      Given   a Microservice
      |service              |definition            |reference             |
      |greetingService      |hello: RequestResponse|hello: RequestResponse|
      |                     |greet$: RequestStream |greet$: RequestStream |
      And     proxy is created by a Microservice
      |serviceName          |methods               |
      |greetingServiceProxy |greet$: RequestStream |
      When    greetingServiceProxy invokes helloPromise
      Then    greetObservable is received
  `, () => {
    const greetingServiceProxy = prepareScalecubeForGreetingService();
    expect.assertions(3);

    const helloPromise = greetingServiceProxy.hello(defaultUser);
    expect(typeof helloPromise.then === 'function').toBeTruthy();
    expect(typeof helloPromise.catch === 'function').toBeTruthy();

    const greetObservable = greetingServiceProxy.greet$(defaultUser);
    expect(isObservable(greetObservable)).toBeTruthy();
  });

  test(`
    # Invokes static methods on class correctly
    // move to 'successful-invoke-proxy.spec.ts'
    Scenario: Proxy invokes a static method successfully 
      Given   a Microservice
      And     static property for method 'RequestResponse'
      |service              |definition            |reference             |
      |greetingService      |hello: RequestResponse|hello: RequestResponse|
      |                     |greet$: RequestStream |greet$: RequestStream |
      And     proxy is created by a Microservice
      |serviceName          |methods               |
      |greetingServiceProxy |hello: RequestResponse|
      When    greetingServiceProxy invokes helloStatic
      Then    valid response received 'Hello from static method, defaultUser' 
    `, () => {
    expect.assertions(1);
    const ms = Microservices.create({ services: [greetingServiceWithStatic] });
    const greetingServiceProxy = ms.createProxy({ serviceDefinition: greetingServiceWithStaticDefinition });
    return expect(greetingServiceProxy.helloStatic(defaultUser)).resolves.toBe('Hello from static method, defaultUser');
  });
});
