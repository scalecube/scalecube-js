import { getGreetingServiceInstance, greetingServiceMeta } from '../__mocks__/GreetingService';

import { MicroService } from '../src/Microservices';
import { defaultRouter } from '../src/Routers/default';

describe('Service proxy', () => {
  console.warn = jest.fn(); // disable validation logs while doing this test

  const defaultUser = 'defaultUser';

  const marketService = {
    serviceDefinition: {
      serviceName: 'MarketService',
      methods: {
        tradeBox$: { asyncModel: 'Observable' },
      },
    },
    service: new MarketService(),
  };

  const ms = MicroService.create({
    services: [getGreetingServiceInstance(), getGreetingServiceInstance()],
  });

  const greetingService = ms.asProxy({
    serviceContract: greetingServiceMeta,
    router: defaultRouter,
  });

  it('Invoke method that define in the contract', () => {
    expect(greetingService.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
  });

  it('Throw error message if method does not define in the contract', () => {
    try {
      greetingService.fakeHello();
    } catch (e) {
      expect(e.message).toEqual(`service method 'fakeHello' missing in the metadata`);
    }
  });
});
