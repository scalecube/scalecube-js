import Worker from 'tiny-worker'
import { Transport } from '../../../src/scalecube-transport/src/Transport';
import { PostMessageProvider } from '../../../src/scalecube-transport/src/provider/PostMessageProvider';
import { errors } from '../../../src/scalecube-transport/src/errors';
import { setWorkers, removeWorkers, httpURI as URI } from '../utils';

describe('Tests specifically for PostMessage provider', () => {
  setWorkers(URI);

  const testInvalidWorker = (worker) => {
    const URIWithInvalidWorker = 'https://localhost:4000';
    window.workers[URIWithInvalidWorker] = worker;
    const transport = new Transport();
    return expect(transport.setProvider(PostMessageProvider, { URI: URIWithInvalidWorker }))
      .rejects.toEqual(new Error(errors.connectionRefused));
  };

  afterAll(() => {
    removeWorkers();
  });

  it.each(['Invalid worker', 777, () => 555, { test: 'test' }]) ('If an item for a provided URI is not a worker instance an error is emitted', (invalidValue) => {
    return testInvalidWorker(invalidValue);
  });

  it ('Communication between workers', async (done) => {
    const transports = {};

    const handleRequestFromWorker = requestWorker => async ({ data: { URI, requestData } }) => {
      let transport;
      if (!transports[URI]) {
        transport = new Transport();
        await transport.setProvider(PostMessageProvider, { URI });
        transports[URI] = transport;
      } else {
        transport = transports[URI];
      }

      const stream = transport.request(requestData);
      stream.subscribe(
        (data) => {
          requestWorker.postMessage({ data, completed: false });
        },
        () => {},
        () => {
          requestWorker.postMessage({ completed: true });
        }
      );

    };

    window.workers['https://localhost:4040'] = new Worker(() => {
      setTimeout(() => {
        self.postMessage({
          URI: 'https://localhost:8080',
          requestData: { headers: { type: 'requestStream', responsesLimit: 3 }, data: 'request test from 4040', entrypoint: '/greeting/many' }
        });
      }, 500);

      self.onmessage = ({ data }) => {
        console.log('Received response in Request Worker 4040!', data);
      }
    });

    window.workers['https://localhost:3030'] = new Worker(() => {
      setTimeout(() => {
        self.postMessage({
          URI: 'https://localhost:8080',
          requestData: { headers: { type: 'requestStream', responsesLimit: 7 }, data: 'request test from 3030', entrypoint: '/greeting/many' }
        });
      }, 500);

      self.onmessage = ({ data }) => {
        console.log('Received response in Request Worker 3030!', data);
      }
    });

    const requestWorker4040 = window.workers['https://localhost:4040'];
    const requestWorker3030 = window.workers['https://localhost:3030'];
    requestWorker4040.onmessage = handleRequestFromWorker(requestWorker4040);
    requestWorker3030.onmessage = handleRequestFromWorker(requestWorker3030);

    setTimeout(() => {
      done();
      Object.values(transports).forEach(transport => transport.removeProvider());
    }, 2500);
  }, 3000);

});
