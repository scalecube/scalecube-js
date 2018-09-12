import GreetingService from 'examples/GreetingServiceClass/GreetingService.js';
import { Microservices } from '../../src/services';

describe('Listen for remote invocations test suite', () => {
  it('When received `Greeting.hello(Idan)` should return "Hello Idan"', (done) => {
    expect.assertions(1);
    const greetingService = Microservices
      .builder()
      .services(new GreetingService())
      .build();
    const stream = transport.request({ headers: { type: 'requestResponse' }, data: ['idan'], entrypoint: '/greeting/hello' });
    stream.subscribe(
      (data) => {
        expect(data).toEqual('Hello Idan');
      },
      undefined,
      done
    );
  });
});
