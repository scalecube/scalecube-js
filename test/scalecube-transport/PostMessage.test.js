import Worker from 'tiny-worker';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/from';
import {validateRequest} from "../../src/scalecube-transport/utils";
import {Transport} from "../../src/scalecube-transport/Transport";
import { PostMessageProvider } from "../../src/scalecube-transport/provider/PostMessageProvider";

describe('PostMessage tests', () => {
  window.workers = {};
  const URI = 'https://localhost:8080';
  window.workers[URI] = new Worker(function () {
    const Observable = require('rxjs').Observable;
    self.onmessage = ({ data: { entrypoint, data, requestId } }) => {
      if (entrypoint === '/greeting/many') {
        Observable.range(1, 5)
          .subscribe(
            result => postMessage({ requestId, data: `Greeting (${result}) to: ${data}`, completed: false }),
            (error) => {},
            () => postMessage({ requestId, data: undefined, completed: true })
          );
      }
    };
  });

  it('Test webworker-threads', async (done) => {
    const transport = new Transport();
    await transport.setProvider(PostMessageProvider, { URI });
    transport.request({ headers: { requestId: Date.now() }, data: 'Test', entrypoint: '/greeting/many' })
      .subscribe(
        data => console.log('data from transport request', data),
        error => {},
        () => console.log('data from transport request COMPLETED!')
      );

    setTimeout(() => {
      done();
    }, 2000);

  });

});
