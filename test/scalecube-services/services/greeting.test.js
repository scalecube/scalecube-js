// @flow

import GreetingService from 'examples/GreetingServiceClass/GreetingService.js';
import { Microservices, Message } from 'src/scalecube-services/services';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';


process.on('unhandledRejection', (reason, promise) => console.log(reason, promise));

describe('Greeting suite', () => {
  it('Greeting.hello should greet Idan with hello', () => {

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
  it('Greeting should fail without args', () => {
    let x = GreetingService;
    const greetingService = Microservices
      .builder()
      .services(new GreetingService(), new GreetingService())
      .build()
      .proxy()
      .api(GreetingService)
      .create();

    expect.assertions(1);
    return expect(greetingService.hello()).rejects.toEqual(new Error("please provide user to greet"));

  });
  it('Greeting.repeatToStream should return observable of greetings ', () => {
    let x = GreetingService;
    const greetingService = Microservices
      .builder()
      .services(new GreetingService(), new GreetingService())
      .build()
      .proxy()
      .api(GreetingService)
      .create();

    expect.assertions(3);
    let i = 0;
    greetingService.repeatToStream('Hello', 'Hey', 'Yo').subscribe((item) => {
      switch (i) {
        case 0:
          expect(item).toBe('Hello');
          break;
        case 1:
          expect(item).toBe('Hey');
          break;
        case 2:
          expect(item).toBe('Yo');
          break;
        default:
          expect(0).toBe(1);
          break;
      }
      i = i + 1;
    });

  });
  it('Greeting.repeatToStream should fail without arg ', () => {
    let x = GreetingService;
    const greetingService = Microservices
      .builder()
      .services(new GreetingService(), new GreetingService())
      .build()

      .proxy()
      .api(GreetingService)
      .create();

    expect.assertions(1);
    greetingService.repeatToStream().subscribe(res=>expect(0).toBe(1), err=>{
      expect(err).toEqual(new Error('please provide Array of greetings'));
    });

  });

  it('Dispatcher should greet Idan with hello', () => {

    const microservices = Microservices.builder()
      .services(new GreetingService())
      .build();

    const dispatcher = microservices.dispatcher().create();

    const message: Message = {
      serviceName: 'GreetingService',
      method: 'hello',
      data: [ 'Idan' ]
    };

    expect.assertions(1);
    return expect(dispatcher.invoke(message)).resolves.toEqual("Hello Idan");
  });

  it('Dispatcher should fail if message data is not Array', () => {

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

  it('Dispatcher should fail with service not found error', () => {

    const microservices = Microservices.builder().build();
    const dispatcher = microservices.dispatcher().create();

    const message = {
      serviceName: 'GreetingService',
      method: 'hello',
      data: [ 'Idan' ]
    };

    expect.assertions(1);
    return expect(dispatcher.invoke(message)).rejects.toEqual(new Error("Service not found error: GreetingService.hello"));

  });

  it('Dispatcher listen should return observable ', () => {
    const microservices = Microservices.builder()
      .services(new GreetingService())
      .build();

    const dispatcher = microservices.dispatcher().create();

    const message: Message = {
      serviceName: 'GreetingService',
      method: 'repeatToStream',
      data: [ 'Hello', 'Hey', 'Yo' ]
    };

    expect.assertions(3);
    let i = 0;
    dispatcher.listen(message).subscribe((item) => {
      switch (i) {
        case 0:
          expect(item).toBe('Hello');
          break;
        case 1:
          expect(item).toBe('Hey');
          break;
        case 2:
          expect(item).toBe('Yo');
          break;
        default:
          expect(0).toBe(1);
          break;
      }
      i = i + 1;
    });

  });
});

