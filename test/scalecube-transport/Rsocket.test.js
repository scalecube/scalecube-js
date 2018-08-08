import { RSocketProvider } from 'src/scalecube-transport/provider/RSocketProvider';
import { Transport } from 'src/scalecube-transport/Transport';
import { errors } from 'src/scalecube-transport/errors';

describe('Rsocket tests', () => {
  let transport;
  let needToRemoveProvider = true;
  const URI = 'ws://localhost:8080';
  const defaultServiceName = 'greeting';
  const text = 'Test text';
  const textResponseSingle = `Echo:${text}`;
  const getTextResponseStream = index => `Greeting (${index}) to: ${text}`;

  const prepareTransport = async () => {
    transport = new Transport();
    await transport.setProvider(RSocketProvider, { URI });
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
    transport.setProvider(RSocketProvider, { URI }).then(() => {
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
    transport.setProvider(RSocketProvider, { URI: 'ws://lo' }).catch((error) => {
      expect(error).toEqual(new Error(errors.urlNotFound));
      needToRemoveProvider = false;
      done();
    });
  });

  it('Providing an url with inactive websocket server causes an error while setting a provider', async (done) => {
    expect.assertions(1);

    transport = new Transport();
    transport.setProvider(RSocketProvider, { URI: 'ws://localhost:9999' }).catch((error) => {
      expect(error).toEqual(new Error(errors.connectionRefused));
      needToRemoveProvider = false;
      done();
    });
  });

  it('If keepAlive is not a number, there is a validation error', async (done) => {
    expect.assertions(1);

    transport = new Transport();
    transport.setProvider(RSocketProvider, { URI, keepAlive: 'test' }).catch((error) => {
      expect(error).toEqual(new Error(errors.wrongKeepAlive));
      needToRemoveProvider = false;
      done();
    });
  });

  it('If lifetime is not a number, there is a validation error', async (done) => {
    expect.assertions(1);

    transport = new Transport();
    transport.setProvider(RSocketProvider, { URI, lifetime: 'test' }).catch((error) => {
      expect(error).toEqual(new Error(errors.wrongLifetime));
      needToRemoveProvider = false;
      done();
    });
  });

  it('If WebSocket is not a function, there is a validation error', async (done) => {
    expect.assertions(1);

    transport = new Transport();
    transport.setProvider(RSocketProvider, { URI, WebSocket: 'test' }).catch((error) => {
      expect(error).toEqual(new Error(errors.wrongWebSocket));
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
        expect(data).toEqual(textResponseSingle);
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
        expect(data).toEqual(textResponseSingle);
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
        expect(data).toEqual({ text: textResponseSingle });
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
        expect(data).toEqual({ text: textResponseSingle });
      },
      undefined,
      done
    );
  });

  it('Use requestResponse type with "many" action - receive one response and the stream is completed', async (done) => {
    expect.assertions(1);

    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestResponse' }, data: text, entrypoint: '/greeting/many' });
    stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseStream(0));
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
        expect(data).toEqual(getTextResponseStream(updates));
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
        expect(data).toEqual(getTextResponseStream(updates));
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
        expect(data).toEqual(getTextResponseStream(updates));
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
        expect(data).toEqual(getTextResponseStream(updates));
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

  it('Disconnect - an error appears in multiple streams with the message about closed connection', async (done) => {
    expect.assertions(7);
    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/many' });
    let updates1 = 0;
    stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseStream(updates1));
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
      entrypoint: `/${defaultServiceName}/many`,
      data: text
    })
      .subscribe(
        (data) => {
          expect(data).toEqual(getTextResponseStream(updates2));
          updates2++;
        },
        (error) => {
          expect(error).toEqual(new Error(errors.closedConnection));
          done();
        }
      );
  });

  it('Request "type" validation error', async (done) => {
    expect.assertions(1);
    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'wrongType' }, data: text, entrypoint: '/greeting/many' });
    stream.subscribe(
      (data) => {},
      (error) => {
        expect(error).toEqual(new Error(errors.wrongType));
        done();
      }
    );
  });

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
    // TODO With responsesLimit we receive two success and error item, with unlimited requests - only one success and error item
    const transport = await prepareTransport();
    const stream = transport.request({ headers: { type: 'requestStream', responsesLimit: 2147483647 }, data: text, entrypoint: '/greeting/failing/many' });
    let updates = 0;
    stream.subscribe(
      (data) => {
        updates++;
        if (updates < 3) {
          expect(data).toEqual(textResponseSingle);
        }
        updates === 3 && expect(data).toEqual({ errorCode: 500, errorMessage: textResponseSingle });
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
        expect(data).toEqual({ errorCode: 500, errorMessage: text });
      },
      (error) => {
        console.log('error', error);
      },
      done
    );
  });

});
