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
    const getTextResponseSingle = text => `Echo:${text}`;
    const getTextResponseMany = index => text => `Greeting (${index}) to: ${text}`;
    const getFailingOneResponse = text => ({ errorCode: 500, errorMessage: text });
    const getFailingManyResponse = text => ({ errorCode: 500, errorMessage: getTextResponseSingle(text) });

    self.onmessage = ({ data: { entrypoint, data, requestId } }) => {
      if (entrypoint === '/greeting/one') {
        postMessage({ requestId, data: getTextResponseSingle(data), completed: false });
        postMessage({ requestId, data: undefined, completed: true });
      }
      if (entrypoint === '/greeting/pojo/one') {
        postMessage({ requestId, data: { text: getTextResponseSingle(data) }, completed: false });
        postMessage({ requestId, data: undefined, completed: true });
      }
      if (entrypoint === '/greeting/many') {
        Observable.interval(100)
          .subscribe(
            result => postMessage({ requestId, data: getTextResponseMany(result)(data), completed: false }),
            (error) => {},
            () => postMessage({ requestId, data: undefined, completed: true })
          );
      }
      if (entrypoint === '/greeting/failing/one') {
        postMessage({ requestId, data: getFailingOneResponse(data), completed: false });
      }
      if (entrypoint === '/greeting/failing/many') {
        // TODO Complete this responses
        postMessage({ requestId, data: getFailingOneResponse(data), completed: false });
        postMessage({ requestId, data: getFailingOneResponse(data), completed: false });
        postMessage({ requestId, data: getFailingOneResponse(data), completed: false });
      }
    };
  });

  it('Test webworker-threads', async (done) => {
    const transport = new Transport();
    await transport.setProvider(PostMessageProvider, { URI });
    transport.request({ headers: { responsesLimit: 3 }, data: 'Test for 100', entrypoint: '/greeting/many' })
      .subscribe(
        data => console.log('onNext', data),
        error => console.log('onError', error),
        () => console.log('Stream completed!')
      );

    setTimeout(() => {
      transport.removeProvider().then(done);
    }, 2000);

  });

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
