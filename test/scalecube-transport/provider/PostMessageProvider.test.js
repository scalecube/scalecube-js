import { Transport } from '../../../src/scalecube-transport/Transport';
import { PostMessageProvider } from "../../../src/scalecube-transport/provider/PostMessageProvider";
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

  it ('If an item for a provided URI is string instead of a Worker, an error is emitted', () => {
    return testInvalidWorker('Invalid worker');
  });

  it ('If an item for a provided URI is number instead of a Worker, an error is emitted', () => {
    return testInvalidWorker(777);
  });

  it ('If an item for a provided URI is a function instead of a Worker, an error is emitted', () => {
    return testInvalidWorker(() => 555);
  });

  it ('If an item for a provided URI does not have a postMessage method, an error is emitted', () => {
    return testInvalidWorker({ test: 'test' });
  });

});
