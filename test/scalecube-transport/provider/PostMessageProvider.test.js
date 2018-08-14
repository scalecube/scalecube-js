import Worker from 'tiny-worker'
import { Transport } from '../../../src/scalecube-transport/Transport';
import { PostMessageProvider } from '../../../src/scalecube-transport/provider/PostMessageProvider';
import { errors } from '../../../src/scalecube-transport/errors';
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

  // TODO Transport content is not compiled inside of worker
  it ('Test', async (done) => {
    const transportWorker = new Worker(async () => {
      const Transport = require('../../../lib/scalecube-transport').Transport;
      const PostMessageProvider = require('../../../lib/scalecube-transport').PostMessageProvider;
      console.log('Transport', Transport);
      const transport = new Transport();
      await transport.setProvider(PostMessageProvider, { URI });
      const stream = transport.request({ headers: { type: 'requestStream' }, data: 'text', entrypoint: '/greeting/many' });
      stream.subscribe((data) => {
        console.log('data', data);
      });
    });
    setTimeout(() => {
      done()
    }, 1500);
  });

});
