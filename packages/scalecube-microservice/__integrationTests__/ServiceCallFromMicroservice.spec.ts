import GreetingService, { greetingServiceDefinition } from '../__mocks__/GreetingService';
import { Microservices } from '../src/Microservices/Microservices';
import { defaultRouter } from '../src/Routers/default';
import { Message, Service } from '../src/api/public';

describe('Test creating proxy from microservice', () => {
  console.warn = jest.fn(); // disable validation logs while doing this test
  console.error = jest.fn(); // disable validation logs while doing this test

  const defaultUser = 'defaultUser';
  const greetingService1: Service = {
    definition: greetingServiceDefinition,
    reference: new GreetingService(),
  };

  const ms = Microservices.create({
    services: [greetingService1],
  });

  const greetingServiceProxy = ms.createServiceCall({
    router: defaultRouter,
  });

  const data = [defaultUser];
  const message: Message = {
    qualifier: '',
    data,
  };

  it('Test requestResponse', () => {
    // return expect(greetingServiceProxy.requestResponse(message)).resolves.toMatchObject({
    //   ...message,
    //   data : `Hello ${data}`
    // });
  });
});
