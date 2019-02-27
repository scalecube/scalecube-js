import GreetingService from 'examples/GreetingServiceClass/GreetingService.js';
import GreetingService2 from 'examples/GreetingServiceClass/GreetingService2.js';
import { Microservices, Message } from '../../src/services';

process.on('unhandledRejection', (reason, promise) => console.log(reason, promise));

describe('Greeting suite', () => {
  it('Greeting.hello should greet Idan with hello', () => {
    const greetingService = Microservices.builder()
      .services(new GreetingService(), new GreetingService())
      .build()
      .proxy()
      .api(GreetingService)
      .create();

    expect.assertions(1);
    return expect(greetingService.hello('Idan')).resolves.toEqual('Hello Idan');
  });
  it('Proxy creation should fail when meta missing', () => {
    const greetingService = Microservices.builder()
      .build()
      .proxy()
      .api({})
      .create();

    expect.assertions(1);
    return expect(greetingService).toEqual(Error('API must have meta property'));
  });
  it('Proxy creation should fail when meta is without service name', () => {
    const greetingService = Microservices.builder()
      .build()
      .proxy()
      .api({ meta: {} })
      .create();

    expect.assertions(1);
    return expect(greetingService).toEqual(Error('service name (api.meta.serviceName) is not defined'));
  });
  it('Proxy creation should fail when meta is without service methods', () => {
    const greetingService = Microservices.builder()
      .build()
      .proxy()
      .api({
        meta: {
          serviceName: 'GreetingService',
        },
      })
      .create();

    expect.assertions(1);
    return expect(greetingService).toEqual(Error('meta.methods is not defined'));
  });
  it('Method on proxy should return undefined if it not in definition', () => {
    const greetingService = Microservices.builder()
      .build()
      .proxy()
      .api({
        meta: {
          serviceName: 'GreetingService',
          methods: {},
        },
      })
      .create();

    expect.assertions(1);
    return expect(greetingService.foo).toBeUndefined();
  });
  // check that we can set service in 2 separate calls to .services
  it('Greeting should return Hello Idan and Greeting 2 should return hey Idan', () => {
    const mcb = Microservices.builder();

    mcb.services(new GreetingService());
    mcb.services(new GreetingService2());

    const mc = mcb.build();

    const greetingServiceProxy = mc
      .proxy()
      .api(GreetingService)
      .create();

    const greetingService2Proxy = mc
      .proxy()
      .api(GreetingService2)
      .create();

    expect.assertions(2);
    return greetingServiceProxy
      .hello('Idan')
      .then((v) => expect(v).toEqual('Hello Idan'))
      .catch((e) => console.error(e))
      .then((v) =>
        greetingService2Proxy
          .hello('Idan')
          .then((v) => expect(v).toEqual('hey Idan'))
          .catch((e) => console.error(e))
      );

    // expect(greetingServiceProxy.hello("Idan")).resolves.toEqual("Hello Idan");
    // expect(greetingService2Proxy.hello("Idan")).resolves.toEqual("hey Idan");
  });
  it('Greeting should fail without args', () => {
    const greetingService = Microservices.builder()
      .services(new GreetingService(), new GreetingService())
      .build()
      .proxy()
      .api(GreetingService)
      .create();

    expect.assertions(1);
    return expect(greetingService.hello()).rejects.toEqual(new Error('please provide user to greet'));
  });
  it('Greeting.repeatToStream should return observable of greetings ', () => {
    const greetingService = Microservices.builder()
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
    const greetingService = Microservices.builder()
      .services(new GreetingService(), new GreetingService())
      .build()

      .proxy()
      .api(GreetingService)
      .create();

    expect.assertions(1);
    greetingService.repeatToStream().subscribe(
      (res) => expect(0).toBe(1),
      (err) => {
        expect(err).toEqual(new Error('please provide Array of greetings'));
      }
    );
  });
  it('Greeting.repeatToStream should trigger unsubscribe ', () => {
    const greetingService = Microservices.builder()
      .services(new GreetingService(), new GreetingService())
      .build()

      .proxy()
      .api(GreetingService)
      .create();

    expect.assertions(1);
    greetingService
      .repeatToStream('hey', 'hello')
      .subscribe()
      .unsubscribe();
    expect(window['repeatToStreamUnsubscribe']).toBe(true);
  });

  it('ServiceCall should greet Idan with hello', () => {
    const microservices = Microservices.builder()
      .services(new GreetingService())
      .build();

    const dispatcher = microservices.dispatcher().create();

    const message: Message = {
      serviceName: 'GreetingService',
      method: 'hello',
      data: ['Idan'],
    };

    expect.assertions(1);
    return expect(dispatcher.invoke(message)).resolves.toEqual('Hello Idan');
  });

  it('ServiceCall should fail if message data is not Array', () => {
    const microservices = Microservices.builder()
      .services(new GreetingService())
      .build();

    const dispatcher = microservices.dispatcher().create();

    const message: Message = {
      serviceName: 'GreetingService',
      method: 'hello',
      data: { user: 'Idan' },
    };

    expect.assertions(1);
    return expect(dispatcher.invoke(message)).rejects.toEqual(new Error('Message format error: data must be Array'));
  });

  it('ServiceCall should fail with service not found error', () => {
    const microservices = Microservices.builder().build();
    const dispatcher = microservices.dispatcher().create();

    const message = {
      serviceName: 'GreetingService',
      method: 'hello',
      data: ['Idan'],
    };

    expect.assertions(1);
    return expect(dispatcher.invoke(message)).rejects.toEqual(
      new Error('Service not found error: GreetingServiceMock.hello')
    );
  });

  it('ServiceCall listen should return observable ', () => {
    const microservices = Microservices.builder()
      .services(new GreetingService())
      .build();

    const dispatcher = microservices.dispatcher().create();

    const message: Message = {
      serviceName: 'GreetingService',
      method: 'repeatToStream',
      data: ['Hello', 'Hey', 'Yo'],
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
