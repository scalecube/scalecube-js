import { RSocketProvider } from 'src/scalecube-transport/provider/RSocketProvider';
import { Transport } from 'src/scalecube-transport/Transport';
import { errors } from 'src/scalecube-transport/errors';

describe('Rsocket tests', () => {
  const URI = 'ws://localhost:8080';
  const defaultServiceName = 'greeting';
  const text = 'Test text';
  const textResponseSingle = `Echo:${text}`;
  const getTextResponseStream = index => `Greeting (${index}) to: ${text}`;

  const createRequestStream = async ({ serviceName = defaultServiceName, type, actionName, data, responsesLimit }) => {
    const headers = { type, responsesLimit };
    const entrypoint = `/${serviceName}/${actionName}`;
    const transport = new Transport();
    await transport.setProvider(RSocketProvider, { URI });
    const stream = transport.request({ headers, data, entrypoint });
    return { transport, stream };
  };

  it('Calling request without setting a provider will cause an error about missing provider', async (done) => {
    const transport = new Transport();
    const stream = transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/many' });
    stream.subscribe(
      () => {},
      (error) => {
        expect(error).toEqual(new Error(errors.noProvider));
        done();
      }
    )
  });

  it('Calling request without waiting for build to be completed will cause an error about missing provider', async (done) => {
    const transport = new Transport();
    transport.setProvider(RSocketProvider, { URI });
    const stream = transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/many' });
    stream.subscribe(
      () => {},
      (error) => {
        expect(error).toEqual(new Error(errors.noProvider));
        done();
      }
    )
  });

  it('Providing an url that does not exist causes an error while setting a provider', async (done) => {
    const transport = new Transport();
    transport.setProvider(RSocketProvider, { URI: 'ws://lo' }).catch((error) => {
      expect(error).toEqual(new Error(errors.urlNotFound));
      done();
    });
  });

  it('Providing an url with inactive websocket server causes an error while setting a provider', async (done) => {
    const transport = new Transport();
    transport.setProvider(RSocketProvider, { URI: 'ws://localhost:9999' }).catch((error) => {
      expect(error).toEqual(new Error(errors.connectionRefused));
      done();
    });
  });

  it('If keepAlive is not a number, there is a validation error', async (done) => {
    const transport = new Transport();
    transport.setProvider(RSocketProvider, { URI, keepAlive: 'test' }).catch((error) => {
      expect(error).toEqual(new Error(errors.wrongKeepAlive));
      done();
    });
  });

  it('If lifetime is not a number, there is a validation error', async (done) => {
    const transport = new Transport();
    transport.setProvider(RSocketProvider, { URI, lifetime: 'test' }).catch((error) => {
      expect(error).toEqual(new Error(errors.wrongLifetime));
      done();
    });
  });

  it('If WebSocket is not a function, there is a validation error', async (done) => {
    const transport = new Transport();
    transport.setProvider(RSocketProvider, { URI, WebSocket: 'test' }).catch((error) => {
      expect(error).toEqual(new Error(errors.wrongWebSocket));
      done();
    });
  });

  it('Use requestResponse type with "one" action - receive one response and the stream is completed', async (done) => {
    expect.assertions(2);

    const { stream } = await createRequestStream({
      type: 'requestResponse',
      actionName: 'one',
      data: text
    });
   stream.subscribe(
      (data) => {
        expect(data).toEqual(textResponseSingle);
      },
      undefined,
      () => {
        expect('Stream has been completed').toBeTruthy();
        done();
      }
    );
  });

  it('Use requestStream type with "one" action - receive one response and the stream is completed', async (done) => {
    expect.assertions(2);

    const { stream } = await createRequestStream({
      type: 'requestStream',
      actionName: 'one',
      data: text
    });
    stream.subscribe(
      (data) => {
        expect(data).toEqual(textResponseSingle);
      },
      undefined,
      () => {
        expect('Stream has been completed').toBeTruthy();
        done();
      }
    );
  });

  it('Use requestResponse type with "pojo/one" action - receive one response and the stream is completed', async (done) => {
    expect.assertions(2);

    const { stream } = await createRequestStream({
      type: 'requestResponse',
      actionName: 'pojo/one',
      data: { text }
    });
    stream.subscribe(
      (data) => {
        expect(data).toEqual({ text: textResponseSingle });
      },
      undefined,
      () => {
        expect('Stream has been completed').toBeTruthy();
        done();
      }
    );
  });

  it('Use requestStream type with "pojo/one" action - receive one response and the stream is completed', async (done) => {
    expect.assertions(2);

    const { stream } = await createRequestStream({
      type: 'requestStream',
      actionName: 'pojo/one',
      data: { text }
    });
    stream.subscribe(
      (data) => {
        expect(data).toEqual({ text: textResponseSingle });
      },
      undefined,
      () => {
        expect('Stream has been completed').toBeTruthy();
        done();
      }
    );
  });

  it('Use requestResponse type with "many" action - receive one response and the stream is completed', async (done) => {
    expect.assertions(2);

    const { stream } = await createRequestStream({
      type: 'requestResponse',
      actionName: 'many',
      data: text
    });
    stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseStream(0));
      },
      undefined,
      () => {
        expect('Stream has been completed').toBeTruthy();
        done();
      }
    );
  });

  it('Use requestStream type with "many" action with responsesLimit = 4 - receive 4 responses and the stream is not completed', async (done) => {
    expect.assertions(5);

    const { stream } = await createRequestStream({
      type: 'requestStream',
      actionName: 'many',
      data: text,
      responsesLimit: 4
    });
    let updates = 0;
    let isStreamCompleted = false;
    stream.subscribe(
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
      expect(isStreamCompleted).toBeFalsy();
      done();
    }, 2000);
  });

  it('Use requestStream type with "many" action without responsesLimit - receive infinite amount of responses', async (done) => {
    const { stream } = await createRequestStream({
      type: 'requestStream',
      actionName: 'many',
      data: text
    });
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
    const { stream } = await createRequestStream({
      type: 'requestStream',
      actionName: 'many',
      data: text
    });
    let updates = 0;
    let isStreamCompleted = false;
    const subscription = stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseStream(updates));
        updates++;
        if (updates === 4) {
          subscription.unsubscribe();
        }
      },
      undefined,
      () => {
        isStreamCompleted = true;
      }
    );

    setTimeout(() => {
      expect(updates).toBe(4);
      expect(isStreamCompleted).toBeFalsy();
      done();
    }, 2000);
  });

  it('Disconnect - an error appears in the stream with the message about closed connection', async (done) => {
    expect.assertions(4);
    const { stream, transport } = await createRequestStream({
      type: 'requestStream',
      actionName: 'many',
      data: text
    });
    let updates = 0;
    const subscription = stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseStream(updates));
        updates++;
        if (updates > 2) {
          transport.removeProvider();
        }
      },
      (error) => {
        expect(error).toEqual(new Error('RSocket: The connection was closed.'));
        done();
      }
    );
  });

  it('Disconnect - an error appears in multiple streams with the message about closed connection', async (done) => {
    expect.assertions(7);
    const { stream, transport } = await createRequestStream({
      type: 'requestStream',
      actionName: 'many',
      data: text
    });
    let updates1 = 0;
    const subscription1 = stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseStream(updates1));
        updates1++;
        if (updates1 > 2) {
          transport.removeProvider();
        }
      },
      (error) => {
        expect(error).toEqual(new Error('RSocket: The connection was closed.'));
      }
    );

    let updates2 = 0;
    const subscription2 = transport.request({
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
          expect(error).toEqual(new Error('RSocket: The connection was closed.'));
          done();
        }
      );
  });

  it('Request "type" validation error', async (done) => {
    expect.assertions(1);
    const { stream } = await createRequestStream({
      type: 'wrongType',
      actionName: 'many',
      data: text
    });
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
    const { stream } = await createRequestStream({
      serviceName: '',
      type: 'requestStream',
      actionName: '',
      data: text
    });
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
    const { stream } = await createRequestStream({
      type: 'requestStream',
      actionName: 'many',
      data: text,
      responsesLimit: '7'
    });
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
    const { stream } = await createRequestStream({
      type: 'requestStream',
      actionName: 'many',
      data: text,
      responsesLimit: -7
    });
    stream.subscribe(
      (data) => {},
      (error) => {
        expect(error).toEqual(new Error(errors.wrongResponsesLimit));
        done();
      }
    );
  });

  it('failing/many test', async (done) => {
    expect.assertions(3);
    // TODO With responsesLimit we receive two success and error item, with unlimited requests - only one success and error item
    const { stream } = await createRequestStream({
      type: 'requestStream',
      actionName: 'failing/many',
      data: text,
      responsesLimit: 2147483647
    });
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
      () => {
        done();
      }
    );
  });

  it('failing/one test', async (done) => {
    expect.assertions(1);
    const { stream } = await createRequestStream({
      type: 'requestResponse',
      actionName: 'failing/one',
      data: text
    });
    stream.subscribe(
      (data) => {
        expect(data).toEqual({ errorCode: 500, errorMessage: text });
      },
      (error) => {
        console.log('error', error);
      },
      (data) => {
        done();
      }
    );
  });

});
