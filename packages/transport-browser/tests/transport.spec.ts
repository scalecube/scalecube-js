import { transport } from '../src';
import { getAddress } from '@scalecube/utils';
import { from } from 'rxjs';
import { transportSpec } from '../../api/src/transport/tests/transport.spec';

describe('transport', () => {
  transportSpec(transport);

  it('should request respond and request stream', async (done) => {
    transport.serverTransport({
      localAddress: getAddress('server'),
      serviceCall: {
        requestResponse: (_) => Promise.resolve('promise'),
        requestStream: (_) => from(['obs']),
      },
      logger: (_) => {},
    });
    const client1 = await transport.clientTransport.start({
      remoteAddress: getAddress('server'),
      logger: (_) => {},
    });
    await transport.clientTransport.start({
      remoteAddress: getAddress('server'),
      logger: (_) => {},
    });

    await client1.requestResponse({ data: ['hello'], qualifier: 'hello' });
    client1.requestStream({ data: ['hello'], qualifier: 'hello' }).subscribe(() => {
      done();
    });
  });
});
