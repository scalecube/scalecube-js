import Worker from 'tiny-worker';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/from';
import { Transport } from '../../src/scalecube-transport/Transport';
import { PostMessageProvider } from "../../src/scalecube-transport/provider/PostMessageProvider";

describe('PostMessage tests', () => {
  window.workers = {};
  const URI = 'https://localhost:8080';
  window.workers[URI] = new Worker(function () {
    const Observable = require('rxjs').Observable;
    self.onmessage = ({ data: { entrypoint, data, requestId } }) => {
      if (entrypoint === '/greeting/many100') {
        Observable.interval(100)
          .subscribe(
            result => postMessage({ requestId, data: `Greeting (${result}) to: ${data}`, completed: false }),
            (error) => {},
            () => postMessage({ requestId, data: undefined, completed: true })
          );
      }

      if (entrypoint === '/greeting/many1000') {
        Observable.interval(500)
          .subscribe(
            result => postMessage({ requestId, data: `Greeting (${result}) to: ${data}`, completed: false }),
            (error) => {},
            () => postMessage({ requestId, data: undefined, completed: true })
          );
      }

      if (entrypoint === '/greeting/one') {
        postMessage({ requestId, data: `Echo: ${data}`, completed: false });
        postMessage({ requestId, data: undefined, completed: true });
      }

    };
  });

  it('Test webworker-threads', async (done) => {
    const transport = new Transport();
    await transport.setProvider(PostMessageProvider, { URI });
    transport.request({ headers: { responsesLimit: 3 }, data: 'Test for 100', entrypoint: '/greeting/many100' })
      .subscribe(
        data => console.log('onNext', data),
        error => console.log('onError 100', error),
        () => console.log('Stream for 100 completed!')
      );

    transport.request({ headers: { responsesLimit: 2 }, data: 'Test for 1000', entrypoint: '/greeting/many1000' })
      .subscribe(
        data => console.log('onNext', data),
        error => console.log('onError 1000', error),
        () => console.log('Stream for 1000 completed!')
      );

    setTimeout(() => {
      transport.removeProvider().then(done);
    }, 3000);

  }, 5000);

  it('Test webworker-threads 2', async (done) => {
    const transport = new Transport();
    await transport.setProvider(PostMessageProvider, { URI });
    transport.request({ data: 'Test', entrypoint: '/greeting/one' })
      .subscribe(
        data => console.log('data from transport request', data),
        error => console.log('error from transport request', error),
        () => console.log('data from transport request COMPLETED!')
      );

    setTimeout(() => {
      transport.removeProvider().then(done);
    }, 2000);

  });

});
