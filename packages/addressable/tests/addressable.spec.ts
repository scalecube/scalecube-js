import { createConnectionClient } from '../src/ConnectionClient';
import { Node } from '../src/Node';
import { createConnectionServer } from '../src/ConnectionServer';
import { bootstrap } from '../src/boostrap';

// Handle address collusion

/*
Feature: Addressable base

Scenario Outline: multiple threads ping pong
Given port "myport" from connect(<address>) inside <thread>
When  port.postmessage('ping')
Then  port should receive pong

Examples:
| thread | address |
| main   | main    |
| main   | iframe  |
| main   | worker  |
| iframe | main    |
| iframe | iframe  |
| iframe | worker  |
| worker | main    |
| worker | iframe  |
| worker | worker  |

/8
 */
function fixture() {
  const iframe = new MessageChannel();
  iframe.port1.start();
  iframe.port2.start();

  const self = {};
  const mainWindow = {
    postMessage,
    addEventListener,
    self,
    top: self,
  };
  const iframeWindow = {
    postMessage: (m: any, o: string, p: MessagePort[]) => iframe.port1.postMessage.bind(iframe.port1)(m, p),
    addEventListener: iframe.port2.addEventListener.bind(iframe.port2),
    top: {
      postMessage,
    },
    self: {},
  };
  const worker = {
    postMessage: (msg: any, p: MessagePort[]) => postMessage(msg, '*', p),
    addEventListener,
  };
  return {
    main: bootstrap(mainWindow, undefined),
    iframe: bootstrap(iframeWindow, undefined),
    worker: bootstrap(undefined, worker),
  };
}
describe(`Scenario Outline: multiple threads ping pong`, () => {
  const examples = [
    { thread: 'main', address: 'main' },
    { thread: 'main', address: 'iframe' },
    { thread: 'main', address: 'worker' },
    { thread: 'iframe', address: 'main' },
    { thread: 'iframe', address: 'iframe' },
    { thread: 'iframe', address: 'worker' },
    { thread: 'worker', address: 'main' },
    { thread: 'worker', address: 'iframe' },
    { thread: 'worker', address: 'worker' },
  ];
  const threads: any = fixture();

  for (const t in threads) {
    threads[t].listen(t, (msg: any, p: MessagePort) => {
      msg.data === 'ping' && p.postMessage('pong from ' + t);
    });
  }

  examples.forEach((example) => {
    test(`Given port from connect(${example.address}) inside ${example.thread}
                    When  port.postmessage('ping')
                    Then  port should receive pong`, async (done) => {
      const port = await threads[example.thread].connect(example.address);
      port.addEventListener('message', (e: any) => {
        expect(e.data).toBe('pong from ' + example.address);
        done();
      });
      port.postMessage('ping');
    });
  });
});
