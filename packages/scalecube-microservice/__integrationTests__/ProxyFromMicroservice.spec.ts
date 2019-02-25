import GreetingService, { greetingServiceDefinition } from '../__mocks__/GreetingService';
import GreetingService2, { greetingServiceDefinition2 } from '../__mocks__/GreetingService2';
import { Microservices } from '../src/Microservices/Microservices';
import { defaultRouter } from '../src/Routers/default';
import { ProxyOptions, Service, ServiceDefinition } from '../src/api/public';
import { asyncModelTypes } from '../src/helpers/utils';
import AsyncModel from '../src/api/public/AsyncModel';

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

  // todo check reject from method (promise)
  // todo check reject from method (observable)
  // todo check proxy doesn't convert the asyncModel to something else

  it('Invoke method that define in the serviceDefinition', () => {
    const greetingServiceProxy = prepareScalecubeForGreetingService();
    return expect(greetingServiceProxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
  });

  it('Throw error message if method does not define in the serviceDefinition', () => {
    const greetingServiceProxy = prepareScalecubeForGreetingService();
    try {
      greetingServiceProxy.fakeHello();
    } catch (e) {
      expect(e.message).toEqual(`service method 'fakeHello' missing in the serviceDefinition`);
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
      expect(e.message).toEqual('service GreetingService is not valid.');
    }
  });

  it('Throw error message when proxy serviceDefinition does not match microservice serviceDefinition - observable', (done) => {
    const greetingServiceMissMatchAsyncModel = prepareScalecubeForGreetingService({
      serviceDefinition: missMatchDefinition,
    });

    greetingServiceMissMatchAsyncModel.hello(defaultUser).subscribe({
      error: (error: Error) => {
        expect(error.message).toMatch('asyncModel miss match, expect Observable but received Promise');
        done();
      },
    });
  });

  it('Throw error message when proxy serviceDefinition does not match microservice serviceDefinition - promise', (done) => {
    const greetingServiceMissMatchAsyncModel = prepareScalecubeForGreetingService({
      serviceDefinition: missMatchDefinition,
    });

    greetingServiceMissMatchAsyncModel.greet$([defaultUser]).catch((error: any) => {
      expect(error.message).toMatch('asyncModel miss match, expect Promise but received Observable');
      done();
    });
  });

  it('Greeting should return Hello Idan and Greeting 2 should return hey Idan', () => {
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
      .hello('Idan')
      .then((greeting1Response: GreetingService) => expect(greeting1Response).toEqual('Hello Idan'))
      .then(() =>
        greetingService2Proxy
          .hello('Idan')
          .then((greeting2Response: GreetingService2) => expect(greeting2Response).toEqual('hey Idan'))
      );
  });
});
