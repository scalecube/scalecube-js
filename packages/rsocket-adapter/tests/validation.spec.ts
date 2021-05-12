import { setupClient, setupServer } from '../src';
import { getAddress } from '@scalecube/utils';
import { of } from 'rxjs';
import { TransportApi } from '@scalecube/api';
import { CLIENT_NOT_IMPL, SERVER_NOT_IMPL } from '../src/helpers/constants';

describe('Test RSocket-adapter validation check', () => {
  const serviceCall: TransportApi.Invoker = {
    requestStream: (message: any) => of({}),
    requestResponse: (message: any) => Promise.resolve(),
  };

  const logger = () => {};

  test(`
  Scenario: startServer is called without configuration
  Given startServer from  setupServer without configuration
  When calling startServer
  Then expection will be thrown
  `, (done) => {
    expect.assertions(1);
    const startServer = setupServer({});
    try {
      startServer({
        localAddress: getAddress('A'),
        logger,
        serviceCall,
      });
    } catch (e) {
      expect(e.message).toMatch(SERVER_NOT_IMPL);
      done();
    }
  });

  test(`
  Scenario: startClient is called without configuration
  Given startClient from  setupClient without configuration
  When calling startClient
  Then expection will be thrown
  `, (done) => {
    expect.assertions(1);
    const client = setupClient({});
    client.start({ remoteAddress: getAddress('A'), logger }).catch((e: Error) => {
      expect(e.message).toMatch(CLIENT_NOT_IMPL);
      done();
    });
  });
});
