/*
  Given microservice with gateway
    And   start method was called and the microservice start listening 
    And   a <service>
         |    <service>        |  asyncModel        | success response
         |ServiceA/methodA | requestResponse | true
         |ServiceA/methodB | requestResponse | false
         |ServiceA/methodC | requestStream     | true
         |ServiceA/methodD | requestStream     | false
    When  a client wants to access the service
    And   the client sends a request to the gateway
    Then  microservice fulfill the request using serviceCall to invoke the service
*/

import { runGateway, definition } from './helpers/utils';
import { Gateway } from '../src/api/Gateway';
import { createGatewayProxy } from '../src/createGatewayProxy';

let gateway: Gateway;
let proxy: any;

beforeAll(async () => {
  gateway = runGateway(8081);
  // gateway.start();
  proxy = await createGatewayProxy('ws://localhost:8081', definition);
});
afterAll(() => {
  return gateway.stop();
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
