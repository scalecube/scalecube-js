import { createConnectionClient } from '../src/ConnectionClient';
import { createConnectionServer } from '../src/ConnectionServer';

function createServerAndClients() {
  const ch1 = new MessageChannel();
  ch1.port1.start();
  ch1.port2.start();

  const ch2 = new MessageChannel();
  ch2.port1.start();
  ch2.port2.start();

  const server = createConnectionServer();
  const client1 = createConnectionClient();
  const client2 = createConnectionClient();
  ch1.port1.addEventListener('message', server.channelHandler);
  ch2.port1.addEventListener('message', server.channelHandler);

  client1.createChannel(ch1.port2.postMessage.bind(ch1.port2));
  client2.createChannel(ch2.port2.postMessage.bind(ch2.port2));
  return { client1, client2 };
}

describe('connection suite', () => {
  test('ping pong', async (done) => {
    const { client1, client2 } = createServerAndClients();
    client1.listen('my address', (msg, p) => {
      msg.data === 'ping' && p.postMessage('pong');
    });
    const port = await client2.connect('my address');
    port.addEventListener('message', (e) => {
      expect(e.data).toBe('pong');
      done();
    });
    port.postMessage('ping');
  });
  test('2 connections ping pong', async (done) => {
    const { client1, client2 } = createServerAndClients();
    client1.listen('my address', (msg, p) => {
      msg.data === 'ping' && p.postMessage('pong');
    });
    const port1 = await client2.connect('my address');
    port1.addEventListener('message', (_) => {
      expect(1).toBe(0);
      done();
    });
    const port2 = await client2.connect('my address');
    port2.addEventListener('message', (e) => {
      expect(e.data).toBe('pong');
      done();
    });
    port2.postMessage('ping');
  });
  test('close connection', async (done) => {
    const { client1, client2 } = createServerAndClients();
    client1.listen('my address', (msg, p) => {
      msg.data === 'ping' && p.postMessage('pong');
    });
    const port = await client2.connect('my address');
    port.addEventListener('message', (e) => {
      expect(e.data).toBe('pong');
      done();
    });
    port.postMessage('ping');
    port.close();
  });
  test('connect before listen', (done) => {
    const { client1, client2 } = createServerAndClients();
    client1.connect('client2').then((port) => {
      port.addEventListener('message', (e) => {
        expect(e.data).toBe('pong');
        done();
      });
      port.postMessage('ping');
    });
    setTimeout(() => {
      client2.listen('client2', (msg, p) => {
        msg.data === 'ping' && p.postMessage('pong');
      });
    }, 200);
  });
  test('Connection timeout', (done) => {
    const { client1, client2 } = createServerAndClients();
    client1
      .connect('client2', 20)
      .then((port) => {
        port.addEventListener('message', () => {
          expect(1).toBe(0);
        });
        port.postMessage('ping');
      })
      .catch((e) => {
        expect(e).toBe('connection timeout');
        done();
      });
    setTimeout(() => {
      client2.listen('client2', (msg, p) => {
        msg.data === 'ping' && p.postMessage('pong');
      });
    }, 200);
  });
  test('client before server', async (done) => {
    const ch1 = new MessageChannel();
    ch1.port1.start();
    ch1.port2.start();

    const client = createConnectionClient();
    client.createChannel(ch1.port2.postMessage.bind(ch1.port2));

    setTimeout(() => {
      const server = createConnectionServer();
      ch1.port1.addEventListener('message', server.channelHandler);
    }, 200);
    client.listen('my address', (msg, p) => {
      msg.data === 'ping' && p.postMessage('pong');
    });
    const port = await client.connect('my address');
    port.addEventListener('message', (e) => {
      expect(e.data).toBe('pong');
      done();
    });
    port.postMessage('ping');
  });
  test('create channel timeout', async (done) => {
    const ch1 = new MessageChannel();
    ch1.port1.start();
    ch1.port2.start();

    const client = createConnectionClient();
    const ok = client.createChannel(ch1.port2.postMessage.bind(ch1.port2), 100);
    ok.catch(done);

    setTimeout(() => {
      const server = createConnectionServer();
      ch1.port1.addEventListener('message', server.channelHandler);
    }, 200);
    client.listen('my address', (msg, p) => {
      msg.data === 'ping' && p.postMessage('pong');
    });
    const port = await client.connect('my address');
    port.addEventListener('message', () => {
      expect(1).toBe(0);
    });
    port.postMessage('ping');
  });
  // TODO clean up after close connection
  test('close connections', async () => {
    // tslint:disable-next-line:no-console
    console.log('FEATURE NOT IMPLEMENTED');
  });
});
