import { isObservable } from 'rxjs';
import GreetingService, { greetingServiceDefinition } from '../mocks/GreetingService';
import GreetingService2, { greetingServiceDefinition2 } from '../mocks/GreetingService2';
import { Microservices } from '../../src/Microservices/Microservices';
import { defaultRouter } from '../../src/Routers/default';
import { ProxyOptions, Service, ServiceDefinition } from '../../src/api/public';
import { asyncModelTypes } from '../../src/helpers/utils';
import AsyncModel from '../../src/api/public/AsyncModel';
import { expectWithFailNow } from '../helpers/utils';
import {
  getAsyncModelMissmatch,
  getServiceIsNotValidError,
  getServiceMethodIsMissingError,
  SERVICE_DEFINITION_NOT_PROVIDED,
  SERVICE_NAME_NOT_PROVIDED,
} from '../../src/helpers/constants';

describe('Test creating proxy from microservice', () => {
  console.warn = jest.fn(); // disable validation logs while doing this test
  console.error = jest.fn(); // disable validation logs while doing this test

  const defaultUser = 'defaultUser';

  const wrongDefinition: ServiceDefinition = {
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
        asyncModel: asyncModelTypes.observable,
      },
      greet$: {
        asyncModel: asyncModelTypes.promise,
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

  const prepareScalecubeForGreetingService = (
    { serviceDefinition = greetingServiceDefinition }: { serviceDefinition: ServiceDefinition } = {} as ProxyOptions
  ) => {
    const ms = Microservices.create({ services: [greetingService] });
    return ms.createProxy({ serviceDefinition });
  };

  it('Invoke method that is defined in the serviceDefinition (requestResponse asyncModel)', () => {
    const greetingServiceProxy = prepareScalecubeForGreetingService();
    return expect(greetingServiceProxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
  });

  it('Invoke method that is defined in the serviceDefinition (requestStream asyncModel)', (done) => {
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

  it('Throw error message when creating proxy with missing serviceDefinition', () => {
    const ms = Microservices.create({ services: [greetingService] });
    try {
      // @ts-ignore-next-line
      ms.createProxy({});
    } catch (e) {
      expect(e.message).toEqual(SERVICE_DEFINITION_NOT_PROVIDED);
    }
  });

  it('Throw error message when creating proxy with missing serviceName in serviceDefinition', () => {
    try {
      // @ts-ignore-next-line
      prepareScalecubeForGreetingService({ serviceDefinition: { methods: { ...greetingServiceDefinition.methods } } });
    } catch (e) {
      expect(e.message).toEqual(SERVICE_NAME_NOT_PROVIDED);
    }
  });

  it('Throw error message when creating proxy with missing methods in serviceDefinition', () => {
    try {
      // @ts-ignore-next-line
      prepareScalecubeForGreetingService({ serviceDefinition: { serviceName: greetingServiceDefinition.serviceName } });
    } catch (e) {
      expect(e.message).toEqual(getServiceIsNotValidError(greetingServiceDefinition.serviceName));
    }
  });

  it('Throw error message if method is not defined in the serviceDefinition', () => {
    const greetingServiceProxy = prepareScalecubeForGreetingService();
    try {
      greetingServiceProxy.fakeHello();
    } catch (e) {
      expect(e.message).toEqual(getServiceMethodIsMissingError('fakeHello'));
    }
  });

  it('Throw error message when creating proxy with invalid serviceDefinition', () => {
    const ms = Microservices.create({ services: [greetingService] });
    try {
      ms.createProxy({
        // @ts-ignore-next-line
        serviceDefinition: wrongDefinition,
        router: defaultRouter,
      });
    } catch (e) {
      expect(e.message).toEqual(getServiceIsNotValidError('GreetingService'));
    }
  });

  it('Throw error message when proxy serviceDefinition does not match microservice serviceDefinition - observable', (done) => {
    const greetingServiceMissMatchAsyncModel = prepareScalecubeForGreetingService({
      serviceDefinition: missMatchDefinition,
    });

    greetingServiceMissMatchAsyncModel.hello(defaultUser).subscribe({
      error: (error: Error) => {
        expectWithFailNow(() => expect(error.message).toMatch(getAsyncModelMissmatch('Observable', 'Promise')), done);
        done();
      },
    });
  });

  it('Throw error message when proxy serviceDefinition does not match microservice serviceDefinition - promise', (done) => {
    const greetingServiceMissMatchAsyncModel = prepareScalecubeForGreetingService({
      serviceDefinition: missMatchDefinition,
    });

    greetingServiceMissMatchAsyncModel.greet$([defaultUser]).catch((error: any) => {
      expectWithFailNow(() => expect(error.message).toMatch(getAsyncModelMissmatch('Promise', 'Observable')), done);
      done();
    });
  });

  it('Proxies for two different services work correctly', () => {
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

  it('The inner logic of throwing errors in method implementation is saved (requestResponse asyncModel)', () => {
    const greetingServiceProxy = prepareScalecubeForGreetingService();
    expect.assertions(1);
    return expect(greetingServiceProxy.hello()).rejects.toEqual(new Error('please provide user to greet'));
  });

  it('The inner logic of throwing errors in method implementation is saved (requestStream asyncModel)', (done) => {
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

  it('Proxy does not convert the asyncModel to some other type', () => {
    const greetingServiceProxy = prepareScalecubeForGreetingService();
    expect.assertions(3);

    const helloPromise = greetingServiceProxy.hello(defaultUser);
    expect(typeof helloPromise.then === 'function').toBeTruthy();
    expect(typeof helloPromise.catch === 'function').toBeTruthy();

    const greetObservable = greetingServiceProxy.greet$(defaultUser);
    expect(isObservable(greetObservable)).toBeTruthy();
  });
});
