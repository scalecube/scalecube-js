import { createConnectionServer } from './ConnectionServer';
import { createConnectionClient } from './ConnectionClient';

export function bootstrap(window: any, worker: any) {
  const server = createConnectionServer();
  const client = createConnectionClient();

  // @ts-ignore
  if (typeof Worker !== 'undefined') {
    const W = Worker;
    // @ts-ignore
    // tslint:disable-next-line:only-arrow-functions
    Worker = function(url: string, options: WorkerOptions = {}) {
      const w = new W(url, options);
      w.addEventListener('message', server.channelHandler);
      return w;
    };
  }

  try {
    // worker
    if (typeof worker !== 'undefined') {
      const localChannel = new MessageChannel();
      localChannel.port1.start();
      localChannel.port2.start();
      worker.addEventListener('message', server.channelHandler);
      localChannel.port2.addEventListener('message', server.channelHandler);
      client.createChannel(localChannel.port1.postMessage.bind(localChannel.port1));
      client.createChannel(worker.postMessage.bind(worker));
      // iframe
    } else if (window && window.top && window.top !== window.self) {
      client.createChannel((msg: any, port: MessagePort) => window.postMessage.bind(window)(msg, '*', port));
      client.createChannel((msg: any, port: MessagePort) => window.top.postMessage.bind(window.top)(msg, '*', port));
      window.addEventListener('message', server.channelHandler);
    }
    // main
    else {
      client.createChannel((msg: any, port: MessagePort) => window.postMessage(msg, '*', port));
      window.addEventListener('message', server.channelHandler);
    }
  } catch (e) {
    // create channel can be failed, it ok, this will catch the rejection
  }

  return client;
}
