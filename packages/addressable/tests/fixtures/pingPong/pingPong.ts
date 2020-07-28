import { connect, listen } from '../../../lib';

const test = (thread) => {
  listen(thread, (msg, port) => {
    port.postMessage('pong');
  });
  ['iframe', 'worker', 'main'].forEach(async (addr) => {
    const port1 = await connect(addr);
    port1.postMessage('ping');
    port1.onmessage = (msg) => {
      // tslint:disable-next-line:no-console
      console.log(`${thread} got ${msg} from ${addr}`);
    };
  });
};

// worker
// @ts-ignore
if (typeof WorkerGlobalScope !== 'undefined') {
  test('worker');
  // iframe
} else if (window && window.top && window.top !== window.self) {
  test('iframe');
}
// main
else {
  test('main');
}
