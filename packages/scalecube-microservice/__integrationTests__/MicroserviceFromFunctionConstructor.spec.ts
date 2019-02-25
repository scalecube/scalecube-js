import GreetingService, { greetingServiceDefinition } from '../__mocks__/GreetingService';
import { Microservices } from '../src/Microservices/Microservices';
import { defaultRouter } from '../src/Routers/default';
import { Service } from '../src/api/public';

describe('Test creating microservice from function constructor', () => {
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

  const greetingService1: Service = {
    definition: greetingServiceDefinition,
    reference: new GreetingService(), // class / module / function
  };
  const greetingService2: Service = {
    definition: greetingServiceDefinition,
    reference: new GreetingService(),
  };

  const ms = Microservices.create({
    services: [greetingService1, greetingService2],
  });

  const greetingServiceProxy = ms.createProxy<GreetingService>({
    serviceDefinition: greetingServiceDefinition,
    router: defaultRouter,
  });

  // todo check serviceDefinition is not missing/incorrect/...

  it('Invoke method that define in the serviceDefinition', () => {
    return expect(greetingServiceProxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
  });

  it('Throw error message when creating microservice with invalid serviceDefinition', () => {
    try {
      const msWithError = Microservices.create({
        // @ts-ignore-next-line
        services: [
          {
            // @ts-ignore-next-line
            definition: wrongDefinition,
            reference: new GreetingService(),
          },
        ],
      });
    } catch (e) {
      expect(e.message).toEqual('service GreetingService is not valid.');
    }
  });
});
