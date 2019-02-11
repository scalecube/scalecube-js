import { fakeService, fakeLazyService, fakeMessage, fakeMethodResponse } from '../../__mocks__/FakeService';
import { handleLazyService$, invokeMethod$, isAsyncLoader } from './actions';
import { Message } from '../api/Message';

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
});
