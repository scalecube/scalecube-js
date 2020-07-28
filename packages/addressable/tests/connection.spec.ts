import { createConnectionClient } from '../src/ConnectionClient';
import { createConnectionServer } from '../src/ConnectionServer';

describe('connection suite', () => {
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

  test('ping pong', async (done) => {
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
});
