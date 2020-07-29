/*
  Given microservice with customized gateway protocol of error delivering

     success:                      {ok: true, data}
     fail with AppServiceError:    {ok: false, data}
     exeption with regular Error:    new Error(msg)

    And   start method was called and the microservice start listening
    And   a <service>
         |    <service>        |  asyncModel        | success response
         |ServiceA/methodA     | requestResponse    | true
         |ServiceA/methodB1    | requestResponse    | false
         |ServiceA/methodB2    | requestResponse    | false
         |ServiceA/methodC     | requestStream      | true
         |ServiceA/methodD1    | requestStream      | false
         |ServiceA/methodD2    | requestStream      | false
    When  a client wants to access the service
    And   the client sends a request to the gateway
    Then  microservice fulfill the request using serviceCall and deliver responses and errors acording to custom Gateway protocol
*/

import { Observable, from, throwError } from 'rxjs';
import { createMicroservice, ASYNC_MODEL_TYPES } from '@scalecube/browser';
import { Gateway } from '../src/Gateway';
import { createGatewayProxy } from '../src/createGatewayProxy';

export class AppServiceError extends Error {
  public code: string;
  constructor(obj) {
    super(obj.message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'AppServiceError';
    this.message = obj.message;
    this.code = obj.code;
  }
}

class ServiceA {
  public methodA() {
    return Promise.resolve({ id: 1 });
  }
  public methodB1() {
    return Promise.reject(new AppServiceError({ code: 'ERR_NOT_FOUND', message: 'methodB1 error' }));
  }
  public methodB2() {
    return Promise.reject(new Error('methodB2 error'));
  }
  public methodC() {
    return from([1, 2]);
  }
  public methodD1() {
    return throwError(new Error('methodD1 error'));
  }
  public methodD2() {
    return throwError(new AppServiceError({ code: 'ERR_NOT_FOUND', message: 'methodD2 error' }));
  }
}

export const definition = {
  serviceName: 'serviceA',
  methods: {
    methodA: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
    methodB1: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
    methodB2: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
    methodC: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM },
    methodD1: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM },
    methodD2: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM },
  },
};
const customServerReqResp = (servCall, data, subscriber) => {
  subscriber.onSubscribe();
  servCall
    .requestResponse(data)
    .then((resp: any) => {
      subscriber.onComplete({ data: { ok: true, data: resp } });
    })
    .catch((e) => {
      if (e instanceof AppServiceError) {
        // @ts-ignore
        return subscriber.onComplete({ data: { ok: false, data: { message: e.message, ...e } } });
      }
      subscriber.onError(e);
    });
};
const customServerReqStream = (servCall, data, subscriber) => {
  subscriber.onSubscribe();
  servCall.requestStream(data).subscribe(
    (resp: any) => {
      subscriber.onNext({ data: { ok: true, data: resp } });
    },
    (e: any) => {
      if (e instanceof AppServiceError) {
        // @ts-ignore
        return subscriber.onNext({ data: { ok: false, data: { message: e.message, ...e } } });
      }
      subscriber.onError(e);
    },
    () => subscriber.onComplete()
  );
};

const port = 8032;
const ms = createMicroservice({ services: [{ definition, reference: new ServiceA() }] });
const serviceCall = ms.createServiceCall({});
const gateway = new Gateway({ port, requestResponse: customServerReqResp, requestStream: customServerReqStream });

const customClientRequestResponse = (socket, qualifier) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      socket
        .requestResponse({
          data: {
            qualifier,
            data: args,
          },
        })
        .subscribe({
          onComplete: ({ data }) => {
            if (!data.ok) {
              return reject(data.data);
            }
            resolve(data.data);
          },
          onError: (e: any) => {
            reject(new Error(e.source.message));
          },
        });
    });
  };
};
const customClientRequestStream = (socket, qualifier) => {
  return (...args) => {
    return new Observable((observer) => {
      socket
        .requestStream({
          data: {
            qualifier,
            data: args,
          },
        })
        .subscribe({
          onSubscribe(subscription) {
            subscription.request(2147483647);
          },
          onNext: ({ data }) => {
            if (!data.ok) {
              return observer.error(data.data);
            }
            observer.next(data.data);
          },
          onComplete: () => {
            observer.complete();
          },
          onError: (e: any) => {
            observer.error(new Error(e.source.message));
          },
        });
    });
  };
};

let proxy: any;

beforeAll(async () => {
  gateway.start({ serviceCall });
  proxy = await createGatewayProxy(
    `ws://localhost:${port}`,
    definition,
    customClientRequestResponse,
    customClientRequestStream
  );
});
afterAll(() => gateway.stop());

test('requestResponse', () => {
  return proxy.methodA().then((resp) => {
    expect(resp).toEqual({ id: 1 });
  });
});

test('fail requestResponse with AppServiceError', () => {
  return proxy.methodB1().catch((e) => {
    expect(e).toMatchObject({ code: 'ERR_NOT_FOUND', name: 'AppServiceError', message: 'methodB1 error' });
  });
});
test('fail requestResponse with regular Error', () => {
  return proxy.methodB2().catch((e) => {
    expect(e.message).toBe('methodB2 error');
  });
});
// test.skip('fail requestResponse with Scalecube Error', () => {
//   return proxy.methodB3().catch((e) => {
//     expect(e.message).toBe('serviceA/methodB3 has valid definition but reference is not a function');
//   });
// });

test('requestStream succeed', (done) => {
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

test('fail requestStream with regular Error', (done) => {
  proxy.methodD1().subscribe(
    done.fail,
    (e) => {
      expect(e.message).toBe('methodD1 error');
      done();
    },
    done.fail
  );
});

test('fail requestStream with AppError', (done) => {
  proxy.methodD2().subscribe(
    done.fail,
    (e) => {
      expect(e).toMatchObject({ code: 'ERR_NOT_FOUND', name: 'AppServiceError', message: 'methodD2 error' });
      done();
    },
    done.fail
  );
});
