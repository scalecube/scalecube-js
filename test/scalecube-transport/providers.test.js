import { Observable } from 'rxjs';
import 'rxjs/add/observable/from';
import { Transport } from '../../src/scalecube-transport/Transport';
import { PostMessageProvider } from '../../src/scalecube-transport/provider/PostMessageProvider';
import { errors } from '../../src/scalecube-transport/errors';
import {
  getTextResponseSingle,
  getTextResponseMany,
  getFailingOneResponse,
  getFailingManyResponse,
  setWorkers,
  httpURI as URI
} from './utils';

describe('Providers tests', () => {
  const text = 'Test message';
  let transport;
  let needToRemoveProvider = true;
  setWorkers(URI);

  const prepareTransport = async () => {
    transport = new Transport();
    await transport.setProvider(PostMessageProvider, { URI });
    return transport;
  };

  afterEach(async () => {
    if (needToRemoveProvider) {
      await transport.removeProvider();
    }
    transport = undefined;
    needToRemoveProvider = true;
  });

  it('Calling request without setting a provider will cause an error about missing provider', async (done) => {
    expect.assertions(1);

    transport = new Transport();
    const stream = transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/many' });
    stream.subscribe(
      () => {},
      (error) => {
        expect(error).toEqual(new Error(errors.noProvider));
        needToRemoveProvider = false;
        done();
      }
    )
  });

  it('Calling request without waiting for build to be completed will cause an error about missing provider', async (done) => {
    expect.assertions(1);

    transport = new Transport();
    transport.setProvider(PostMessageProvider, { URI }).then(() => {
      done();
    });
    const stream = transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/many' });
    stream.subscribe(
      () => {},
      (error) => {
        expect(error).toEqual(new Error(errors.noProvider));
      }
    )
  });

  it('Providing an url that does not exist causes an error while setting a provider', async (done) => {
    expect.assertions(1);

    transport = new Transport();
    transport.setProvider(PostMessageProvider, { URI: 'ws://lo' }).catch((error) => {
      expect(error).toEqual(new Error(errors.urlNotFound));
      needToRemoveProvider = false;
      done();
    });
  });

  it('Use requestResponse type with "one" action - receive one response and the stream is completed', async (done) => {
    expect.assertions(1);

    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestResponse' }, data: text, entrypoint: '/greeting/one' });
    stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseSingle(text));
      },
      (error) => console.log('error', error),
      done
    );
  });

  it('Use requestStream type with "one" action - receive one response and the stream is completed', async (done) => {
    expect.assertions(1);

    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/one' });
    stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseSingle(text));
      },
      undefined,
      done
    );
  });

  it('Use requestResponse type with "pojo/one" action - receive one response and the stream is completed', async (done) => {
    expect.assertions(1);

    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestResponse' }, data: { text }, entrypoint: '/greeting/pojo/one' });
    stream.subscribe(
      (data) => {
        expect(data).toEqual({ text: getTextResponseSingle(text) });
      },
      undefined,
      done
    );
  });

  it('Use requestStream type with "pojo/one" action - receive one response and the stream is completed', async (done) => {
    expect.assertions(1);

    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestStream' }, data: { text }, entrypoint: '/greeting/pojo/one' });
    stream.subscribe(
      (data) => {
        expect(data).toEqual({ text: getTextResponseSingle(text) });
      },
      undefined,
      done
    );
  });

  it('Use requestStream type with "many" action with responsesLimit = 4 - receive 4 responses and the stream is completed', async (done) => {
    expect.assertions(4);

    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestStream', responsesLimit: 4 }, data: text, entrypoint: '/greeting/many' });
    let updates = 0;
    stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseMany(updates)(text));
        updates++;
      },
      undefined,
      done
    );
  });

  it('Use requestStream type with "many" action without responsesLimit - receive infinite amount of responses', async (done) => {
    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/many' });
    let updates = 0;
    let isStreamCompleted = false;
    const subscription = stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseMany(updates)(text));
        updates++;
      },
      undefined,
      () => {
        isStreamCompleted = true;
      }
    );

    setTimeout(() => {
      expect(updates > 20).toBeTruthy();
      expect(isStreamCompleted).toBeFalsy();
      subscription.unsubscribe();
      done();
    }, 4500);
  }, 5000);

  it('Use requestStream type with "many" action without responsesLimit and unsubscribe after the 4 update', async (done) => {
    expect.assertions(5);
    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/many' });
    let updates = 0;
    const subscription = stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseMany(updates)(text));
        updates++;
        if (updates === 4) {
          subscription.unsubscribe();
        }
      }
    );

    setTimeout(() => {
      expect(updates).toBe(4);
      done();
    }, 2000);
  });

  it('Disconnect - an error appears in the stream with the message about closed connection', async (done) => {
    expect.assertions(4);
    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/many' });
    let updates = 0;
    stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseMany(updates)(text));
        updates++;
        if (updates > 2) {
          transport.removeProvider();
          needToRemoveProvider = false;
        }
      },
      (error) => {
        expect(error).toEqual(new Error(errors.closedConnection));
        done();
      }
    );
  });

  // TODO Fix this test
  // it('Disconnect - an error appears in multiple streams with the message about closed connection', async (done) => {
  //   expect.assertions(7);
  //   const transport = await prepareTransport();
  //   const stream = transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/many' });
  //   let updates1 = 0;
  //   stream.subscribe(
  //     (data) => {
  //       expect(data).toEqual(getTextResponseMany(updates1)(text));
  //       updates1++;
  //       if (updates1 > 2) {
  //         transport.removeProvider();
  //         needToRemoveProvider = false;
  //       }
  //     },
  //     (error) => {
  //       expect(error).toEqual(new Error(errors.closedConnection));
  //     }
  //   );
  //
  //   let updates2 = 0;
  //   transport.request({
  //     headers: { type: 'requestStream' },
  //     entrypoint: `/greeting/many`,
  //     data: text
  //   })
  //     .subscribe(
  //       (data) => {
  //         expect(data).toEqual(getTextResponseMany(updates2)(text));
  //         updates2++;
  //       },
  //       (error) => {
  //         expect(error).toEqual(new Error(errors.closedConnection));
  //         done();
  //       }
  //     );
  // });

  it('Request "entrypoint" validation error', async (done) => {
    expect.assertions(1);
    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestResponse' }, data: text, entrypoint: '' });
    stream.subscribe(
      (data) => {},
      (error) => {
        expect(error).toEqual(new Error(errors.wrongEntrypoint));
        done();
      }
    );
  });

  it('Request "responsesLimit" validation error, if responsesLimit is a string', async (done) => {
    expect.assertions(1);
    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestStream', responsesLimit: '7' }, data: text, entrypoint: '/greeting/many' });
    stream.subscribe(
      (data) => {},
      (error) => {
        expect(error).toEqual(new Error(errors.wrongResponsesLimit));
        done();
      }
    );
  });

  it('Request "responsesLimit" validation error, if responsesLimit is less than zero', async (done) => {
    expect.assertions(1);
    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestStream', responsesLimit: -7 }, data: text, entrypoint: '/greeting/many' });
    stream.subscribe(
      (data) => {},
      (error) => {
        expect(error).toEqual(new Error(errors.wrongResponsesLimit));
        done();
      }
    );
  });

  it('failing/many - 2 data without error code and one data with an error code has been received in onNext block of the stream and the stream has been completed', async (done) => {
    expect.assertions(3);
    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestStream', responsesLimit: 2147483647 }, data: text, entrypoint: '/greeting/failing/many' });
    let updates = 0;
    stream.subscribe(
      (data) => {
        updates++;
        if (updates < 3) {
          expect(data).toEqual(getTextResponseSingle(text));
        }
        updates === 3 && expect(data).toEqual(getFailingManyResponse(text));
      },
      (error) => {
        console.log('error', error);
      },
      done
    );
  });

  it('failing/one test - data with an error code has been received in onNext block of the stream and the stream has been completed', async (done) => {
    expect.assertions(1);
    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestResponse' }, data: text, entrypoint: '/greeting/failing/one' });
    stream.subscribe(
      (data) => {
        expect(data).toEqual(getFailingOneResponse(text));
      },
      (error) => {
        console.log('error', error);
      },
      done
    );
  });

});


// describe('PostMessage tests - OLD', () => {
//   window.workers = {};
//   const URI = 'https://localhost:8080';
//
//   window.workers[URI] = new Worker(function () {
//     const Observable = require('rxjs').Observable;
//     const getTextResponseSingle = text => `Echo:${text}`;
//     const getTextResponseMany = index => text => `Greeting (${index}) to: ${text}`;
//     const getFailingOneResponse = text => ({ errorCode: 500, errorMessage: text });
//     const getFailingManyResponse = text => ({ errorCode: 500, errorMessage: getTextResponseSingle(text) });
//
//     self.onmessage = ({ data: { entrypoint, data, requestId } }) => {
//       if (entrypoint === '/greeting/one') {
//         postMessage({ requestId, data: getTextResponseSingle(data), completed: false });
//         postMessage({ requestId, data: undefined, completed: true });
//       }
//       if (entrypoint === '/greeting/pojo/one') {
//         postMessage({ requestId, data: { text: getTextResponseSingle(data) }, completed: false });
//         postMessage({ requestId, data: undefined, completed: true });
//       }
//       if (entrypoint === '/greeting/many') {
//         Observable.interval(100)
//           .subscribe(
//             result => postMessage({ requestId, data: getTextResponseMany(result)(data), completed: false }),
//             (error) => {},
//             () => postMessage({ requestId, data: undefined, completed: true })
//           );
//       }
//       if (entrypoint === '/greeting/failing/one') {
//         postMessage({ requestId, data: getFailingOneResponse(data), completed: false });
//       }
//       if (entrypoint === '/greeting/failing/many') {
//         postMessage({ requestId, data: getTextResponseSingle(data), completed: false });
//         postMessage({ requestId, data: getTextResponseSingle(data), completed: false });
//         postMessage({ requestId, data: getFailingManyResponse(data), completed: false });
//       }
//     };
//   });
//
//   it('Test webworker-threads', async (done) => {
//     const transport = new Transport();
//     await transport.setProvider(PostMessageProvider, { URI });
//     transport.request({ headers: { responsesLimit: 3 }, data: 'Test for 100', entrypoint: '/greeting/many' })
//       .subscribe(
//         data => console.log('onNext', data),
//         error => console.log('onError', error),
//         () => console.log('Stream completed!')
//       );
//
//     setTimeout(() => {
//       transport.removeProvider().then(done);
//     }, 2000);
//
//   });
//
//   it('Test webworker-threads 2', async (done) => {
//     const transport = new Transport();
//     await transport.setProvider(PostMessageProvider, { URI });
//     transport.request({ data: 'Test', entrypoint: '/greeting/one' })
//       .subscribe(
//         data => console.log('data from transport request', data),
//         error => console.log('error from transport request', error),
//         () => console.log('data from transport request COMPLETED!')
//       );
//
//     setTimeout(() => {
//       transport.removeProvider().then(done);
//     }, 2000);
//
//   });
//
// });
