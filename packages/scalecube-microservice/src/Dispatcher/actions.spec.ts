import { fakeService, fakeLazyService, fakeMessage, fakeMethodResponse } from '../../__mocks__/FakeService';
import {
  handleLazyService$,
  invokeMethod$,
  isAsyncLoader,
  processMethodBaseOnLaziness$,
  enrichMsgData$,
} from './actions';
import { Message } from '../api/Message';
import { map } from 'rxjs6/operators';

describe('Dispatcher actions', () => {
  let subscriber;

  beforeEach(() => {
    subscriber && subscriber.unsubscribe();
  });

  it('Test isAsyncLoader(service): boolean', () => {
    expect(isAsyncLoader(fakeService)).toBe(false);
    expect(isAsyncLoader(fakeLazyService)).toBe(true);
  });

  it('Test invokeMethod$({ method, context, msg }): Observable<Message>', () => {
    expect.assertions(1);
    const method = fakeService.fakeMethod;

    subscriber = invokeMethod$({ method, context: null, msg: fakeMessage }).subscribe((msg: Message) => {
      expect(msg.data).toEqual(fakeMethodResponse);
    });
  });

  it('Test handleLazyService$({ method, context, msg}): Observable<Message>', (done) => {
    expect.assertions(1);
    const method = fakeLazyService.fakeMethod.loader;

    subscriber = handleLazyService$({ method, context: fakeService, msg: fakeMessage }).subscribe((msg: Message) => {
      expect(msg.data).toEqual(fakeMethodResponse);
      done();
    });
  });

  it('Test lazy processMethodBaseOnLaziness$({ serviceInstance, method, msg}): Observable<Message>', (done) => {
    expect.assertions(1);
    const method = fakeLazyService.fakeMethod.loader;

    subscriber = processMethodBaseOnLaziness$({
      method,
      serviceInstance: fakeLazyService,
      msg: fakeMessage,
    }).subscribe((msg: Message) => {
      expect(msg.data).toEqual(fakeMethodResponse);
      done();
    });
  });

  it('Test not-lazy processMethodBaseOnLaziness$({ serviceInstance, method, msg}): Observable<Message>', (done) => {
    expect.assertions(1);
    const method = fakeService.fakeMethod;

    subscriber = processMethodBaseOnLaziness$({
      method,
      serviceInstance: fakeService,
      msg: fakeMessage,
    }).subscribe((msg: Message) => {
      expect(msg.data).toEqual(fakeMethodResponse);
      done();
    });
  });

  it('Test enrichMethod=null enrichMsgData$({ msg, enrichMethod }): Observable<Message>', (done) => {
    expect.assertions(1);

    subscriber = enrichMsgData$({
      msg: fakeMessage,
      enrichMethod: null,
    }).subscribe((msg: Message) => {
      expect(msg.data).toEqual(fakeMessage.data);
      done();
    });
  });

  it('Test enrichMsgData$({ msg, enrichMethod }): Observable<Message>', (done) => {
    expect.assertions(1);

    const text = `Don't fake it`;

    subscriber = enrichMsgData$({
      msg: fakeMessage,
      enrichMethod: (req$) =>
        req$.pipe(
          map((req) => ({
            ...req,
            data: text,
          }))
        ),
    }).subscribe((msg: Message) => {
      expect(msg.data).toEqual(text);
      done();
    });
  });
});
