import GreetingService, { greetingServiceDefinition } from '../__mocks__/GreetingService';
import { Microservices } from '../src/Microservices/Microservices';
import { defaultRouter } from '../src/Routers/default';
import { Service } from '../src/api/public';

describe('Service proxy', () => {
  console.warn = jest.fn(); // disable validation logs while doing this test

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

  const greetingService1: Service = {
    definition: greetingServiceDefinition,
    implementation: new GreetingService(),
  };
  const greetingService2: Service = {
    definition: greetingServiceDefinition,
    implementation: new GreetingService(),
  };

  const ms = Microservices.create({
    services: [greetingService1, greetingService2],
  });

  const greetingServiceProxy = ms.createProxy({
    serviceDefinition: greetingServiceDefinition,
    router: defaultRouter,
  });

  it('Invoke method that define in the contract', () => {
    return expect(greetingServiceProxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
  });

  it('Throw error message if method does not define in the contract', () => {
    try {
      greetingServiceProxy.fakeHello();
    } catch (e) {
      expect(e.message).toEqual(`service method 'fakeHello' missing in the metadata`);
    }
  });

  it('Throw error message when async model in the serviceDefinition of proxy is incorrect', () => {
    const greetingServiceProxyWithError = ms.createProxy({
      // @ts-ignore-next-line
      serviceDefinition: wrongDefinition,
      router: defaultRouter,
    });
    try {
      greetingServiceProxyWithError.hello(defaultUser);
    } catch (e) {
      expect(e.message).toEqual('service method unknown type error: GreetingService.hello');
    }
  });
});
