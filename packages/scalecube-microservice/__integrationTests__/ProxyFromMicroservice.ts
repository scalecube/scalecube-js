import GreetingService, { greetingServiceDefinition } from '../__mocks__/GreetingService';
import { Microservices } from '../src/Microservices/Microservices';
import { defaultRouter } from '../src/Routers/default';
import { Service } from '../src/api/public';
import { asyncModelTypes } from '../src/helpers/utils';
import { EMPTY } from 'rxjs6';
import { catchError } from 'rxjs6/operators';

describe('Test creating proxy from microservice', () => {
  console.warn = jest.fn(); // disable validation logs while doing this test
  console.error = jest.fn(); // disable validation logs while doing this test

  const defaultUser = 'defaultUser';
  const wrongDefinition = {
    ...greetingServiceDefinition,
    methods: {
      ...greetingServiceDefinition.methods,
      hello: {
        asyncModel: 'wrongAsyncModel',
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

  const greetingService1: Service = {
    definition: greetingServiceDefinition,
    reference: new GreetingService(),
  };

  const ms = Microservices.create({
    services: [greetingService1],
  });

  const greetingServiceProxy = ms.createProxy({
    serviceDefinition: greetingServiceDefinition,
    router: defaultRouter,
  });

  const greetingServiceMissMatchAsyncModel = ms.createProxy({
    serviceDefinition: missMatchDefinition,
    router: defaultRouter,
  });

  it('Invoke method that define in the serviceDefinition', () => {
    return expect(greetingServiceProxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
  });

  it('Throw error message if method does not define in the serviceDefinition', () => {
    try {
      greetingServiceProxy.fakeHello();
    } catch (e) {
      expect(e.message).toEqual(`service method 'fakeHello' missing in the metadata`);
    }
  });

  it('Throw error message when creating proxy with invalid serviceDefinition', () => {
    try {
      const greetingServiceProxyWithError = ms.createProxy({
        // @ts-ignore-next-line
        serviceDefinition: wrongDefinition,
        router: defaultRouter,
      });
    } catch (e) {
      expect(e.message).toEqual('service GreetingService is not valid.');
    }
  });

  it('Throw error message when proxy serviceDefinition does not match microservice serviceDefinition - observable', (done) => {
    greetingServiceMissMatchAsyncModel
      .hello(defaultUser)
      .pipe(
        catchError((error: any) => {
          expect(error.message).toMatch('asyncModel miss match, expect Observable but received Promise');
          done();
          return EMPTY;
        })
      )
      .subscribe();
  });

  it('Throw error message when proxy serviceDefinition does not match microservice serviceDefinition - promise', (done) => {
    greetingServiceMissMatchAsyncModel.greet$([defaultUser]).catch((error: any) => {
      expect(error.message).toMatch('asyncModel miss match, expect Promise but received Observable');
      done();
    });
  });
});
