// @flow
import { PromiseGreetingService, OnDemandGreetingService, onDemandLoader } from 'examples/GreetingServiceClass/PromiseGreetingService.js';
import GreetingService from 'examples/GreetingServiceClass/GreetingService.js';
import { Microservices } from 'src/scalecube-services/services';
import makeLoader from 'src/annotations/es6/makeLoader';


describe('Greeting suite', () => {
  it('Greeting.hello should greet Idan with hello', () => {

    const greetingService = Microservices
      .builder()
      .services(PromiseGreetingService)
      .build()
      .proxy()
      .api(GreetingService)
      .create();

    expect.assertions(1);
    return expect(greetingService.hello('Idan')).resolves.toEqual("Hello Idan");
  });
  it('OnDemandGreetingService.hello should greet Idan with hello', () => {

    const greetingService = Microservices
      .builder()
      .services(OnDemandGreetingService)
      .build()
      .proxy()
      .api(GreetingService)
      .create();

    expect.assertions(1);
    return expect(greetingService.hello('Idan')).resolves.toEqual("Hello Idan");
  });
  it('Greeting should should be called only after we are calling it', () => {
    const loader = onDemandLoader();
    const then = loader.then;
    loader.then = jest.fn(then);

    const OnDemandGreetingService = makeLoader(
      loader,
      GreetingService
    );

    const greetingService = Microservices
      .builder()
      .services(OnDemandGreetingService)
      .build()
      .proxy()
      .api(GreetingService)
      .create();

    expect(loader.then.mock.calls.length).toBe(0);
    greetingService.hello('Idan')
    expect(loader.then.mock.calls.length).toBe(1);
  });
});