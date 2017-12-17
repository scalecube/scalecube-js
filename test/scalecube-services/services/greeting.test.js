// @flow

import GreetingService from 'examples/GreetingServiceClass/GreetingService.js';
import { Microservices, Message } from 'src/scalecube-services/services';

process.on('unhandledRejection', (reason, promise) => console.log(reason,promise));

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

    expect.assertions(1);
    return expect(greetingService.hello('Idan')).resolves.toEqual("Hello Idan");
  });
  it('Dispatcher should greet Idan with hello', ()=>{

    const microservices = Microservices.builder()
      .services(new GreetingService())
      .build();

    const dispatcher = microservices.dispatcher().create();

    const message: Message = {
      serviceName: 'GreetingService',
      method: 'hello',
      data: ['Idan']
    };

    expect.assertions(1);
    return expect(dispatcher.invoke(message)).resolves.toEqual("Hello Idan");
  });

  it('Dispatcher should fail if message data is not Array', ()=>{

    const microservices = Microservices.builder()
      .services(new GreetingService())
      .build();

    const dispatcher = microservices.dispatcher().create();

    const message: Message = {
      serviceName: 'GreetingService',
      method: 'hello',
      data: {user: 'Idan'}
    };


    expect.assertions(1);
    return expect(dispatcher.invoke(message)).rejects.toEqual(new Error("Message format error: data must be Array"));
  });

  it('Dispatcher should fail with service not found error', ()=>{

    const microservices = Microservices.builder().build();
    const dispatcher = microservices.dispatcher().create();

    const message = {
      serviceName: 'GreetingService',
      method: 'hello',
      data: ['Idan']
    };

    expect.assertions(1);
    return expect(dispatcher.invoke(message)).rejects.toEqual(new Error("Service not found error: GreetingService.hello"));

  });
});

