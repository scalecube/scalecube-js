import { transport } from '../src';
import { getAddress } from '@scalecube/utils';
import { from } from 'rxjs';

describe('transport', () => {
  it('should request respond and request stream', async (done) => {
    transport.serverTransport({
      localAddress: getAddress('server'),
      serviceCall: {
        requestResponse: (message) => Promise.resolve('promise'),
        requestStream: (message) => from(['obs']),
      },
      logger: (msg) => {},
    });
    const client1 = await transport.clientTransport.start({
      remoteAddress: getAddress('server'),
      logger: (msg) => {},
    });
    const client2 = await transport.clientTransport.start({
      remoteAddress: getAddress('server'),
      logger: (msg) => {},
    });

    const res1 = await client1.requestResponse({ data: ['hello'], qualifier: 'hello' });
    client1.requestStream({ data: ['hello'], qualifier: 'hello' }).subscribe(() => {
      done();
    });
  });
});
