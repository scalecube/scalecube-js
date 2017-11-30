// @flow

import GreetingService from 'examples/GreetingServiceClass/GreetingService.js';
import { Microservices } from 'src/scalecube-services';

describe('Greeting suite', () =>{
  it('Greeting should greet Idan with hello', ()=>{

    let x = GreetingService;
    const greetingService = Microservices
      .builder()
      .services(new GreetingService(), new GreetingService())
      .build()
      .proxy()
      .api(GreetingService)
      .create();

    expect(greetingService.hello('Idan')).toBe("Hello Idan");
  });
});

