import TinyWorker from 'tiny-worker';
import GreetingService from 'examples/GreetingServiceClass/GreetingService.js';
import GreetingService2 from 'examples/GreetingServiceClass/GreetingService2.js';
import { Microservices } from '../../src/services';
import { Transport } from '../../src/transport/Transport';
import { PostMessageProvider } from '../../src/transport/provider/PostMessageProvider';
import EventEmitter from 'events';

describe('Listen for remote invocations test suite', () => {

  global.serviceEventEmitter = new EventEmitter();
  afterEach(() => {
    serviceEventEmitter.removeAllListeners(['serviceRequest', 'serviceResponse']);
    window.workers.workerURI.terminate();
  });

  afterAll(() => {
    delete global.serviceEventEmitter;
  });

  it('When received `Greeting.hello(Idan)` should return "Hello Idan"', async (done) => {
    const URI = 'workerURI';
    window.workers = {
      [URI]: new TinyWorker(() => {
        onmessage = (ev) => {
          postMessage(ev.data);
        };
      })
    };

    expect.assertions(4);
    const mc = Microservices
      .builder()
      .services(new GreetingService())
      .services(new GreetingService2())
      .build();

    mc.proxy()
      .api(GreetingService)
      .create();

    mc.proxy()
      .api(GreetingService2)
      .create();

    const transport = new Transport();
    await transport.setProvider(PostMessageProvider, { URI });

    window.workers.workerURI.onmessage = ({ data }) => {
      const eventName = data.entrypoint ? 'serviceRequest' : 'serviceResponse';
      serviceEventEmitter.emit(eventName, data);
    };

    const stream = transport.request({ headers: { type: 'requestResponse' }, data: ['Idan'], entrypoint: '/greeting/hello' });
    stream.subscribe(
      (data) => {
        expect(data).toEqual('Hello Idan');
      },
      () => console.log('error', error),
      () => {
        expect(true).toBeTruthy();
      }
    );

    const stream2 = transport.request({ headers: { type: 'requestResponse' }, data: ['Idan'], entrypoint: '/greeting2/hello' });
    stream2.subscribe(
      (data) => {
        expect(data).toEqual('hey Idan');
      },
      () => console.log('error', error),
      () => {
        expect(true).toBeTruthy();
      }
    );

    setTimeout(() => {
      done();
    }, 1000);
  });

  it('When received `Greeting.repeatToStream("hello", "Hi")` should return "Hello", "Hi"', async (done) => {
    const URI = 'workerURI';
    window.workers = {
      [URI]: new TinyWorker(() => {
        onmessage = (ev) => {
          postMessage(ev.data);
        };
      })
    };
    expect.assertions(2);
    const { serviceEventEmitter } = Microservices
      .builder()
      .services(new GreetingService())
      .build()
      .proxy()
      .api(GreetingService)
      .create();

    const transport = new Transport();
    await transport.setProvider(PostMessageProvider, { URI });

    window.workers.workerURI.onmessage = ({ data }) => {
      const eventName = data.entrypoint ? 'serviceRequest' : 'serviceResponse';
      serviceEventEmitter.emit(eventName, data);
    };

    const stream = transport.request({ headers: { type: 'requestStream' }, data: ['Hello', 'Hi'], entrypoint: '/greeting/repeatToStream' });
    let updates = 0;
    stream.subscribe(
      (data) => {
        updates++;
        switch (updates) {
          case 1: {
            expect(data).toEqual('Hello');
            break;
          }
          case 2: {
            expect(data).toEqual('Hi');
            done();
            break;
          }
          default: {
            // Should not happen
            expect(true).toBeFalsy();
          }
        }
      }
    );

  });

});
