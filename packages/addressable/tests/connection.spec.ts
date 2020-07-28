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
});
