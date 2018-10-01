import { Transport } from '../src/Transport';
import { RSocketProvider } from '../src/provider/RSocketProvider';
import { PostMessageProvider } from '../src/provider/PostMessageProvider';
import { errors } from '../src/errors';
import {
  setWorkers,
  removeWorkers,
  httpURI,
  socketURI
} from './utils';
import {
  getTextResponseSingle,
  getTextResponseMany,
  getFailingOneResponse,
  getFailingManyResponse
} from '../src/utils';
import { startServer, stopServer } from '../src/server/server';

startServer();

describe.each([[RSocketProvider, socketURI, 'RSocket'], [PostMessageProvider, httpURI, 'PostMessage']])
(`Transport client test suite`, (Provider, URI, providerName) => {
  const text = 'Test message';
  let transport;
  let needToRemoveProvider = true;

  const prepareTransport = async () => {
    transport = new Transport();
    await transport.setProvider(Provider, { URI });
    return transport;
  };

  beforeAll(() => {
    setWorkers(httpURI);
  });

  afterAll(() => {
    removeWorkers();
    stopServer();
  });

  afterEach(async () => {
    if (needToRemoveProvider) {
      await transport.removeProvider();
    }
    transport = undefined;
    needToRemoveProvider = true;
  });

  it(`${providerName}: Calling request without setting a provider will cause an error about missing provider`, async (done) => {
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

  it(`${providerName}: Calling request without waiting for build to be completed will cause an error about missing provider`, async (done) => {
    expect.assertions(1);

    transport = new Transport();
    transport.setProvider(Provider, { URI }).then(() => {
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

  it(`${providerName}: Providing an url that does not exist causes an error while setting a provider`, async (done) => {
    expect.assertions(1);
    transport = new Transport();
    transport.setProvider(Provider, { URI: 'ws://lo' }).catch((error) => {
      expect(error).toEqual(new Error(errors.noConnection));
      needToRemoveProvider = false;
      done();
    });
  });

  it(`${providerName}: Use requestResponse type with "one" action - receive one response and the stream is completed`, async (done) => {
    expect.assertions(1);
    transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestResponse' }, data: text, entrypoint: '/greeting/one' });
    stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseSingle(text));
      },
      (error) => console.log('error', error),
      done
    );
  });


  it(`${providerName}: Use requestStream type with "one" action - receive one response and the stream is completed`, async (done) => {
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

  it(`${providerName}: Use requestResponse type with "pojo/one" action - receive one response and the stream is completed`, async (done) => {
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

  it(`${providerName}: Use requestStream type with "pojo/one" action - receive one response and the stream is completed`, async (done) => {
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

  it.only(`${providerName}: Use requestStream type with "many" action with responsesLimit = 4 - receive 4 responses and the stream is completed`, async (done) => {
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

  it(`${providerName}: Use requestStream type with "many" action without responsesLimit - receive infinite amount of responses`, async (done) => {
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

  it(`${providerName}: Use requestStream type with "many" action without responsesLimit and unsubscribe after the 4 update`, async (done) => {
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

  it(`${providerName}: Disconnect - an error appears in the stream with the message about closed connection`, async (done) => {
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

  it(`${providerName}: Disconnect - an error appears in multiple streams with the message about closed connection`, async (done) => {
    expect.assertions(7);
    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/many' });
    let updates1 = 0;
    stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseMany(updates1)(text));
        updates1++;
        if (updates1 > 2) {
          transport.removeProvider();
          needToRemoveProvider = false;
        }
      },
      (error) => {
        expect(error).toEqual(new Error(errors.closedConnection));
      }
    );

    let updates2 = 0;
    transport.request({
      headers: { type: 'requestStream' },
      entrypoint: `/greeting/many`,
      data: text
    })
      .subscribe(
        (data) => {
          expect(data).toEqual(getTextResponseMany(updates2)(text));
          updates2++;
        },
        (error) => {
          expect(error).toEqual(new Error(errors.closedConnection));
          done();
        }
      );
  });

  it(`${providerName}: Request "entrypoint" validation error`, async (done) => {
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

  it(`${providerName}: Request "responsesLimit" validation error, if responsesLimit is a string`, async (done) => {
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

  it(`${providerName}: Request "responsesLimit" validation error, if responsesLimit is less than zero`, async (done) => {
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

  it(`${providerName}: failing/many - 2 data without error code and one data with an error code has been received in onNext block of the stream and the stream has been completed`, async (done) => {
    expect.assertions(3);
    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/failing/many' });
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

  it(`${providerName}: failing/one test - data with an error code has been received in onNext block of the stream and the stream has been completed`, async (done) => {
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

  it(`${providerName}: Creating a few streams for different requests is handled correctly (when first one is limited and the second is unlimited)`, async (done) => {
    const transport = await prepareTransport();
    let updates1 = 0;
    let isStream1Completed = false;
    transport.request({ headers: { type: 'requestStream', responsesLimit: 3 }, data: text, entrypoint: '/greeting/many' })
      .subscribe(
        (data) => {
          expect(data).toEqual(getTextResponseMany(updates1)(text));
          updates1++;
        },
        error => {},
        () => { isStream1Completed = true; }
      );

    let updates2 = 0;
    let isStream2Completed = false;
    transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/many' })
      .subscribe(
        (data) => {
          expect(data).toEqual(getTextResponseMany(updates2)(text));
          updates2++;
        },
        error => {},
        () => { isStream2Completed = true; }
      );

    setTimeout(() => {
      expect(updates1).toEqual(3);
      expect(isStream1Completed).toEqual(true);
      expect(updates2 > 10).toEqual(true);
      expect(isStream2Completed).toEqual(false);
      done();
    }, 2000);

  });

  it(`${providerName}: Creating a few streams for different requests is handled correctly (when first one is unlimited and the second is limited)`, async (done) => {
    const transport = await prepareTransport();
    let updates1 = 0;
    let isStream1Completed = false;
    transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/many' })
      .subscribe(
        (data) => {
          expect(data).toEqual(getTextResponseMany(updates1)(text));
          updates1++;
        },
        error => {},
        () => { isStream1Completed = true; }
      );

    let updates2 = 0;
    let isStream2Completed = false;
    transport.request({ headers: { type: 'requestStream', responsesLimit: 3 }, data: text, entrypoint: '/greeting/many' })
      .subscribe(
        (data) => {
          expect(data).toEqual(getTextResponseMany(updates2)(text));
          updates2++;
        },
        error => {},
        () => { isStream2Completed = true; }
      );

    setTimeout(() => {
      expect(updates1 > 10).toEqual(true);
      expect(isStream1Completed).toEqual(false);
      expect(updates2).toEqual(3);
      expect(isStream2Completed).toEqual(true);
      done();
    }, 2000);
  });

});
