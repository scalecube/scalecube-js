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

import { Gateway as GatewayInterface } from '../src/api/Gateway';
import { Gateway } from '../src/Gateway';
import { createGatewayProxy } from '../src/createGatewayProxy';
import { from, throwError } from 'rxjs';
import { createMicroservice, ASYNC_MODEL_TYPES } from '@scalecube/browser';

class ServiceA {
  public methodA() {
    return Promise.resolve({ id: 1 });
  }
  public methodB() {
    return Promise.reject(new Error('methodB error'));
  }
  public methodC() {
    return from([1, 2]);
  }
  public methodD() {
    return throwError(new Error('methodD error'));
  }
}

export const definition = {
  serviceName: 'serviceA',
  methods: {
    methodA: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
    methodB: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
    methodC: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM },
    methodD: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM },
  },
};

const port = 8480;

const gateway: GatewayInterface = new Gateway({ port });
const ms = createMicroservice({
  services: [{ definition, reference: new ServiceA() }],
});
const serviceCall = ms.createServiceCall({});

let proxy: any;

beforeAll(async () => {
  gateway.start({ serviceCall });
  proxy = await createGatewayProxy(`ws://localhost:${port}`, definition);
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
    expect(e.source.message).toBe('methodB error');
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
      expect(e.source.message).toBe('methodD error');
      done();
    },
    done.fail
  );
});
