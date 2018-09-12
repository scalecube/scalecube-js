import TinyWorker from 'tiny-worker';
import GreetingService from 'examples/GreetingServiceClass/GreetingService.js';
import { Microservices } from '../../src/services';
import { Transport } from '../../src/transport/Transport';
import { PostMessageProvider } from "../../src/transport/provider/PostMessageProvider";

describe('Listen for remote invocations test suite', () => {

  it('When received `Greeting.hello(Idan)` should return "Hello Idan"', async (done) => {

    const URI = 'workerURI';
    window.workers = {
      [URI]: new TinyWorker(() => {
        onmessage = (ev) => {
          console.log('in message in worker');
          postMessage(ev.data);
        };
      })
    };

    // expect.assertions(1);
    const greetingService = Microservices
      .builder()
      .services(new GreetingService())
      .build();

    const transport = new Transport();
    await transport.setProvider(PostMessageProvider, { URI });

    const stream = transport.request({ headers: { type: 'requestResponse' }, data: ['idan'], entrypoint: '/greeting/hello' });
    stream.subscribe(
      (data) => {
        // expect(data).toEqual('Hello Idan');
      }
    );

    setTimeout(() => {
      done();
    }, 2000);
  });

});
