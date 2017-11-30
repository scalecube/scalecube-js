// @flow

import GreetingService from 'GreetingService.js';
import { Microservices } from 'sdk/Microservices.js';


class Test {
  hello(x, y, z){
    console.log(x(),y,z);
    return 'world';
  }
}
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

    console.log(greetingService);
    expect(greetingService.hello('Idan')).toBe("Hello Idan");
  });
});

