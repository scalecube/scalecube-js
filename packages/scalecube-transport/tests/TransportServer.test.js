import { Observable } from 'rxjs';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Transport } from '../src/Transport';
import { RSocketClientProvider } from '../src/provider/RSocketClientProvider';
import { RSocketServerProvider } from '../src/provider/RSocketServerProvider';
import { socketURI } from './utils';
import { getTextResponseSingle, getTextResponseMany } from '../src/utils';

describe('Transport server test suite', () => {

  const text = 'Hello world';
  let transport;
  const prepareTransport = async () => {
    transport = new Transport();
    await transport.setProvider(RSocketServerProvider, {});
    await transport.setProvider(RSocketClientProvider, { URI: socketURI });
    return transport;
  };

  afterEach(async () => {
    await transport.removeProvider();
  });

  it('Listen for "greeting/one" if callback emits one value - sends one response and the stream is completed', async (done) => {
    expect.assertions(1);
    const result = getTextResponseSingle(text);
    await prepareTransport();

    transport.listen('/greeting/one', request => Observable.of(getTextResponseSingle(request.data)));
    const stream = transport.request({ headers: { type: 'requestResponse' }, data: text, entrypoint: '/greeting/one' });
    stream.subscribe(
      data => expect(data).toEqual(result),
      undefined,
      () => done()
    );
  });

  it('Listen for "greeting/one" if callback emits many values - sends one response and the stream is completed', async (done) => {
    expect.assertions(3);
    await prepareTransport();

    transport.listen('/greeting/one', request => Observable
      .timer(100)
      .map((index) => getTextResponseMany(index)(request.data))
    );
    const stream = transport.request({ headers: { type: 'requestResponse' }, data: text, entrypoint: '/greeting/one' });
    let updates = 0;
    let isStreamCompleted = false;
    stream.subscribe(
      data => {
        updates++;
        expect(data).toEqual(getTextResponseMany(0)(text));
      },
      undefined,
      () => { isStreamCompleted = true; }
    );
    setTimeout(() => {
      expect(updates).toEqual(1);
      expect(isStreamCompleted).toBeTruthy();
      done();
    }, 1000);
  });

  it('Listen for "greeting/many" with responsesLimit = 3 - sends 3 responses and the stream is completed', async (done) => {
    expect.assertions(4);
    await prepareTransport();

    transport.listen('/greeting/many', (request) => {
      return Observable
        .interval(100)
        .map((index) => getTextResponseMany(index)(request.data));
    });
    const stream = transport.request({ headers: { type: 'requestStream', responsesLimit: 3 }, data: text, entrypoint: '/greeting/many' });
    let updates = 0;
    stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseMany(updates)(text));
        updates++;
      },
      undefined,
      () => {
        expect(updates).toEqual(3);
      }
    );

    setTimeout(done, 1000);
  });

  it('Listen for "greeting/many" without responsesLimit sends infinite amount of responses and the stream is not completed', async (done) => {
    await prepareTransport();

    transport
      .listen('/greeting/many', (request) => {
        return Observable
          .interval(100)
          .map((index) => getTextResponseMany(index)(request.data));
      });
    const stream = transport.request({ headers: { type: 'requestStream' }, data: text, entrypoint: '/greeting/many' });

    let updates = 0;
    const subscription = stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseMany(updates)(text));
        updates++;
      }
    );

    setTimeout(async () => {
      expect(updates > 15);
      subscription.unsubscribe();
      done();
    }, 2000);
  });

  it('Multiple requests for requestStream (one with responsesLimit, other without) are handled correctly', async (done) => {
    await prepareTransport();
    const greetingText = text;
    const greetingText2 = `${text}2`;

    transport
      .listen('/greeting/many', (request) => {
        return Observable
          .interval(100)
          .map((index) => getTextResponseMany(index)(request.data));
      })
      .listen('/greeting2/many', (request) => {
        return Observable
          .interval(100)
          .map((index) => getTextResponseMany(index)(request.data));
      });
    const stream = transport.request({ headers: { type: 'requestStream', responsesLimit: 5 }, data: greetingText, entrypoint: '/greeting/many' });
    const stream2 = transport.request({ headers: { type: 'requestStream' }, data: greetingText2, entrypoint: '/greeting2/many' });

    let updates = 0;
    let isStreamCompleted = false;
    const subscription = stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseMany(updates)(greetingText));
        updates++;
      },
      undefined,
      () => { isStreamCompleted = true; }
    );

    let updates2 = 0;
    let isStream2Completed = false;
    const subscription2 = stream2.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseMany(updates2)(greetingText2));
        updates2++;
      },
      undefined,
      () => { isStream2Completed = true; }
    );

    setTimeout(async () => {
      expect(updates === 5).toBeTruthy();
      expect(updates2 > 15).toBeTruthy();
      expect(isStreamCompleted).toBeTruthy();
      expect(isStream2Completed).toBeFalsy();
      subscription.unsubscribe();
      subscription2.unsubscribe();
      done();
    }, 2000);
  });

  it('Multiple requests for requestResponse are handled correctly', async (done) => {
    expect.assertions(6);
    await prepareTransport();
    const greetingText = text;
    const greetingText2 = `${text}2`;
    const result = getTextResponseSingle(greetingText);
    const result2 = getTextResponseSingle(greetingText2);

    transport
      .listen('/greeting/one', (request) => {
        return Observable
          .interval(100)
          .map((index) => getTextResponseSingle(request.data));
      })
      .listen('/greeting2/one', (request) => {
        return Observable
          .interval(100)
          .map((index) => getTextResponseSingle(request.data));
      });
    const stream = transport.request({ headers: { type: 'requestResponse' }, data: greetingText, entrypoint: '/greeting/one' });
    const stream2 = transport.request({ headers: { type: 'requestResponse' }, data: greetingText2, entrypoint: '/greeting2/one' });

    let updates = 0;
    let isStreamCompleted = false;
    const subscription = stream.subscribe(
      (data) => {
        expect(data).toEqual(result);
        updates++;
      },
      undefined,
      () => { isStreamCompleted = true; }
    );

    let updates2 = 0;
    let isStream2Completed = false;
    const subscription2 = stream2.subscribe(
      (data) => {
        expect(data).toEqual(result2);
        updates2++;
      },
      undefined,
      () => { isStream2Completed = true; }
    );

    setTimeout(async () => {
      expect(updates === 1).toBeTruthy();
      expect(updates2 === 1).toBeTruthy();
      expect(isStreamCompleted).toBeTruthy();
      expect(isStream2Completed).toBeTruthy();
      subscription.unsubscribe();
      subscription2.unsubscribe();
      done();
    }, 1000);
  });

  it('requestStream and requestResponse are handled correctly', async (done) => {
    expect.assertions(10);
    await prepareTransport();
    const greetingText = text;
    const greetingText2 = `${text}2`;

    transport
      .listen('/greeting/many', (request) => {
        return Observable
          .interval(100)
          .map((index) => getTextResponseMany(index)(request.data));
      })
      .listen('/greeting2/one', (request) => Observable.of(getTextResponseSingle(request.data)));
    const stream = transport.request({ headers: { type: 'requestStream', responsesLimit: 5 }, data: greetingText, entrypoint: '/greeting/many' });
    const stream2 = transport.request({ headers: { type: 'requestResponse' }, data: greetingText2, entrypoint: '/greeting2/one' });

    let updates = 0;
    let isStreamCompleted = false;
    const subscription = stream.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseMany(updates)(greetingText));
        updates++;
      },
      undefined,
      () => { isStreamCompleted = true; }
    );

    let updates2 = 0;
    let isStream2Completed = false;
    const subscription2 = stream2.subscribe(
      (data) => {
        expect(data).toEqual(getTextResponseSingle(greetingText2));
        updates2++;
      },
      undefined,
      () => { isStream2Completed = true; }
    );

    setTimeout(async () => {
      expect(updates === 5).toBeTruthy();
      expect(updates2 === 1).toBeTruthy();
      expect(isStreamCompleted).toBeTruthy();
      expect(isStream2Completed).toBeTruthy();
      subscription.unsubscribe();
      subscription2.unsubscribe();
      done();
    }, 2000);
  });

});


