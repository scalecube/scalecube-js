import { RSocketProvider } from 'src/scalecube-transport/provider/RSocketProvider';

describe('Rsocket tests', () => {

  const serviceName = 'greeting';
  const text = 'Test text';
  const textResponseSingle = `Echo:${text}`;
  const getTextResponseStream = index => `Greeting (${index}) to: ${text}`;
  const url = 'ws://localhost:8080';
  const createRequestStream = async ({ type, actionName, data, responsesLimit }) => {
    const rSocketProvider = new RSocketProvider({ url });
    await rSocketProvider.connect();
    const stream = rSocketProvider.request({ serviceName, type, actionName, data, responsesLimit });
    return { rSocketProvider, stream };
  };

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

  it('Use requestResponse type with "failing/one"', async (done) => {
    const { stream } = await createRequestStream({
      type: 'requestResponse',
      actionName: 'failing/one',
      data: text
    });
    const subscription = stream.subscribe(
      (data) => {
        console.log('data', data);
      },
      (error) => {
        console.log('error', error);
      }
    );

    setTimeout(() => {
      done();
    }, 2000);
  });

  it('Disconnect - an error appears in the stream with the message about closed connection', async (done) => {
    expect.assertions(4);
    const { stream, rSocketProvider } = await createRequestStream({
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
          rSocketProvider.disconnect();
        }
      },
      (error) => {
        expect(error).toEqual(new Error('RSocket: The connection was closed.'));
        subscription.unsubscribe();
        done();
      }
    );
  });

  it('Disconnect - an error appears in multiple streams with the message about closed connection', async (done) => {
    expect.assertions(7);
    const { stream, rSocketProvider } = await createRequestStream({
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
          rSocketProvider.disconnect();
        }
      },
      (error) => {
        expect(error).toEqual(new Error('RSocket: The connection was closed.'));
        subscription1.unsubscribe();
      }
    );

    let updates2 = 0;
    const subscription2 = rSocketProvider.request({
      serviceName,
      type: 'requestStream',
      actionName: 'many',
      data: text
    })
      .subscribe(
        (data) => {
          expect(data).toEqual(getTextResponseStream(updates2));
          updates2++;
        },
        (error) => {
          expect(error).toEqual(new Error('RSocket: The connection was closed.'));
          subscription2.unsubscribe();
          done();
        }
      );
  });

});
