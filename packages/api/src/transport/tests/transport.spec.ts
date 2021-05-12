import { Transport } from '../index';
import { getAddress, getFullAddress } from '@scalecube/utils';
import { from, interval, throwError } from 'rxjs';
import { finalize } from 'rxjs/operators';

export function transportSpec(transport: Transport) {
  function create() {
    const client = transport.clientTransport.start({
      logger: (_) => {},
      remoteAddress: getAddress('server'),
    });
    transport.serverTransport({
      logger: (_) => {},
      serviceCall: {
        requestStream: (message) =>
          message.qualifier === 'stream' && message.data[0] === '$'
            ? from(['A', 'B', 'C'])
            : throwError('error stream'),
        requestResponse: (message) =>
          message.qualifier === 'ping' && message.data[0] === 'ping'
            ? Promise.resolve('pong')
            : Promise.reject('error pong'),
      },
      localAddress: getAddress('server'),
    });

    return client;
  }

  describe('transport API suite', () => {
    test('Transport.ClientTransport.start should return Promise to invoker', async () => {
      // when promise resolved invoker should be ready
      const t = await transport.clientTransport.start({
        logger: (_) => {},
        remoteAddress: getAddress('server'),
      });
      expect(typeof t.requestResponse).toBe('function');
      expect(typeof t.requestStream).toBe('function');
    });
    test('Transport.ClientTransport.destroy should trigger error for all open invocation', async (done) => {
      const res: any = [];
      const client = await transport.clientTransport.start({
        logger: (_) => {},
        remoteAddress: getAddress('server'),
      });
      transport.serverTransport({
        logger: (_) => {},
        serviceCall: {
          requestStream: (_) =>
            interval(1).pipe(
              finalize(() => {
                res.push('finalize');
              })
            ),
          requestResponse: (_) => Promise.resolve(),
        },
        localAddress: getAddress('server'),
      });
      client.requestStream({ data: ['a'], qualifier: 'q' }).subscribe(
        () => {},
        (e) => {
          res.push(e);
        }
      );

      setTimeout(() => {
        transport.clientTransport.destroy({
          address: getFullAddress(getAddress('server')),
          logger: (_) => {},
        });
      }, 20);
      setTimeout(() => {
        expect(res).toEqual(['Transport client shutdown', 'finalize']);
        done();
      }, 40);
    });
    test('Transport.ServerTransport should open a transport server and return destroy function', () => {
      const destroy = transport.serverTransport({
        logger: (_) => {},
        serviceCall: {
          requestStream: (_) => from([]),
          requestResponse: (_) => Promise.resolve(),
        },
        localAddress: getAddress('server'),
      });
      expect(typeof destroy).toBe('function');
    });
    test('Server destroy function should unsubscribe all streams and emit error for all open requests', async (done) => {
      const res: any = [];
      const client = await transport.clientTransport.start({
        logger: (_) => {},
        remoteAddress: getAddress('server1'),
      });
      const destroy = transport.serverTransport({
        logger: (_) => {},
        serviceCall: {
          requestStream: (_) =>
            interval(1).pipe(
              finalize(() => {
                res.push('finalize');
              })
            ),
          requestResponse: (_) => Promise.resolve(),
        },
        localAddress: getAddress('server1'),
      });
      client.requestStream({ data: ['a'], qualifier: 'q' }).subscribe(
        () => {},
        (e) => {
          res.push(e);
        }
      );

      setTimeout(() => {
        destroy();
      }, 20);
      setTimeout(() => {
        expect(res).toEqual(['Transport server shutdown', 'finalize']);
        done();
      }, 40);
    });
    test('Invoker.RequestResponse Ping pong', async () => {
      const client = await create();
      const res = await client.requestResponse({ data: ['ping'], qualifier: 'ping' });
      expect(res).toBe('pong');
    });
    test('Invoker.RequestResponse Ping error', async () => {
      const client = await create();
      try {
        await client.requestResponse({ data: ['error'], qualifier: 'ping' });
      } catch (e) {
        expect(e).toBe('error pong');
      }
    });
    test('Invoker.RequestStream ^-A-B-C-$ test', async (done) => {
      const client = await create();
      const res: any = [];

      client.requestStream({ data: ['$'], qualifier: 'stream' }).subscribe(
        (i) => res.push(i),
        (_) => expect(1).toBe(0),
        () => {
          expect(res).toEqual(['A', 'B', 'C']);
          done();
        }
      );
    });
    test('Invoker.RequestStream ^-! test', async (done) => {
      const client = await create();

      client.requestStream({ data: ['!'], qualifier: 'stream' }).subscribe(
        (_) => expect(1).toBe(0),
        (_) => done(),
        () => expect(1).toBe(0)
      );
    });
    test('Invoker requestStream.unsubscribe should trigger serviceCall unsubscribe', async (done) => {
      const client = await transport.clientTransport.start({
        logger: (_) => {},
        remoteAddress: getAddress('server'),
      });
      transport.serverTransport({
        logger: (_) => {},
        serviceCall: {
          requestStream: (_) => interval(1).pipe(finalize(() => done())),
          requestResponse: (_) => Promise.resolve(),
        },
        localAddress: getAddress('server'),
      });

      const sub = client.requestStream({ data: ['a'], qualifier: 'q' }).subscribe();

      setTimeout(() => sub.unsubscribe(), 20);
    });
  });
}
