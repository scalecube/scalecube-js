import TinyWorker from 'tiny-worker';
import GreetingService from 'examples/GreetingServiceClass/GreetingService.js';
import { Microservices } from '../../src/services';
import { Transport } from '../../src/transport/Transport';
import { PostMessageProvider } from "../../src/transport/provider/PostMessageProvider";

describe('Listen for remote invocations test suite', () => {

  let eventEmmiter = null;
  afterEach(() => {
    eventEmmiter.removeAllListeners(['serviceRequest', 'serviceResponse']);
    window.workers.workerURI.terminate();
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

    expect.assertions(1);
    const { serviceEventEmitter } = Microservices
      .builder()
      .services(new GreetingService())
      .build()
      .proxy()
      .api(GreetingService)
      .create();
    eventEmmiter = serviceEventEmitter;

    const transport = new Transport();
    await transport.setProvider(PostMessageProvider, { URI, eventEmitter: serviceEventEmitter });

    window.workers.workerURI.onmessage = ({ data }) => {
      serviceEventEmitter.emit('serviceRequest', data);
    };

    const stream = transport.request({ headers: { type: 'requestResponse' }, data: ['Idan'], entrypoint: '/hello' });
    stream.subscribe(
      (data) => {
        expect(data).toEqual('Hello Idan');
      },
      () => console.log('error', error),
      () => {
        expect(true).toBeTruthy();
        done();
      }
    );
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
    eventEmmiter = serviceEventEmitter;

    const transport = new Transport();
    await transport.setProvider(PostMessageProvider, { URI, eventEmitter: serviceEventEmitter });

    window.workers.workerURI.onmessage = ({ data }) => {
      serviceEventEmitter.emit('serviceRequest', data);
    };

    const stream = transport.request({ headers: { type: 'requestStream' }, data: ['Hello', 'Hi'], entrypoint: '/repeatToStream' });
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
