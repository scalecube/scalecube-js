import { runGateway, definition } from './helpers/utils';
import { Gateway } from '../src/api/Gateway';
import { createGatewayProxy } from '../src/createGatewayProxy';

let gateway: Gateway;
let proxy: any;

beforeAll(async () => {
  gateway = runGateway();
  // gateway.start();
  proxy = await createGatewayProxy('ws://localhost:8080', definition);
});
afterAll(() => {
  gateway.stop();
});

test('requestResponse', () => {
  return proxy.methodA().then((resp) => {
    expect(resp).toEqual({ id: 1 });
  });
});
test('fail requestResponse', () => {
  return proxy.methodB().catch((e) => {
    expect(e).toMatchObject({ code: 'ERR_NOT_FOUND', message: 'methodB error' });
  });
});
test('requestStream', (done) => {
  const responses = [1, 2];
  proxy.methodC().subscribe(
    (resp) => {
      expect(resp).toEqual(responses.shift());
    },
    (e) => {
      throw e;
    },
    done
  );
});

test('fail requestStream', (done) => {
  const responses = [1, 2];
  proxy.methodD().subscribe(
    done.fail,
    (e) => {
      expect(e).toMatchObject({ code: 'ERR_NOT_FOUND', message: 'methodD error' });
      done();
    },
    done.fail
  );
});
