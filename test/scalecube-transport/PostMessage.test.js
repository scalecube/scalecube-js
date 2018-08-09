import { Observable } from 'rxjs';
import 'rxjs/add/observable/from';
import { Transport } from '../../src/scalecube-transport/Transport';
import { PostMessageProvider } from "../../src/scalecube-transport/provider/PostMessageProvider";
import { errors } from '../../src/scalecube-transport/errors';
import { getTextResponseSingle, getTextResponseMany, getFailingOneResponse, getFailingManyResponse, setWorkers, executeWorkerContent, URI } from './utils';

describe('Tests specifically for PostMessage provider', () => {
  const text = 'Test message';
  let transport;
  let needToRemoveProvider = true;
  setWorkers(URI);

  const prepareTransport = async () => {
    transport = new Transport();
    await transport.setProvider(PostMessageProvider, { URI });
    return transport;
  };

  afterEach(async () => {
    if (needToRemoveProvider) {
      await transport.removeProvider();
    }
    transport = undefined;
    needToRemoveProvider = true;
  });

});
