import { Observable, from } from 'rxjs';
import { createMicroservice, ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
import { Gateway } from '../src/Gateway';
import { createGatewayProxy } from '../src/createGatewayProxy';

const definitionA = {
  serviceName: 'serviceA',
  methods: {
    methodA: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
  },
};
const definitionB = {
  serviceName: 'serviceB',
  methods: {
    methodB: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM },
  },
};
const serviceA = { methodA: (arg) => Promise.resolve(arg + '_ok') };
const serviceB = { methodB: (arg) => from([arg + '_good', arg + '_night']) };
const services = [{ definition: definitionA, reference: serviceA }, { definition: definitionB, reference: serviceB }];

const customServerReqResp = (serviceCall, data, subscriber) => {
  console.log('req DATA', data);
  subscriber.onSubscribe();
  data.data = data.data.req; // unpack
  serviceCall.requestResponse(data).then((resp: any) => {
    subscriber.onComplete({ data: { resp: 'custom cb used' } });
  });
};
const customServerReqStream = (serviceCall, data, subscriber) => {
  subscriber.onSubscribe();
  serviceCall.requestStream(data.req).subscribe(
    (response: any) => {
      subscriber.onNext({ data: { resp: response + '_custom' } });
    },
    (error: any) => subscriber.onError(error),
    () => subscriber.onComplete()
  );
};
const ms = createMicroservice({ services });
const serviceCall = ms.createServiceCall({});
const gateway = new Gateway({ port: 8080, requestResponse: customServerReqResp, requestStream: customServerReqStream });
gateway.start({ serviceCall });

let proxyA;
let proxyB;

const customClientRequestResponse = (socket, qualifier) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      socket
        .requestResponse({
          data: {
            qualifier,
            data: { req: args },
          },
        })
        .subscribe({
          onComplete: ({ data }) => {
            console.log('resp Data', data);
            resolve(data.resp);
          },
          onError: (e: any) => {
            reject(e);
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
            req: {
              qualifier,
              data: args,
            },
          },
        })
        .subscribe({
          onSubscribe(subscription) {
            subscription.request(2147483647);
          },
          onNext: ({ data }) => {
            observer.next(data.resp);
          },
          onComplete: () => {
            observer.complete();
          },
          onError: (e: any) => {
            observer.error(e);
          },
        });
    });
  };
};
beforeAll(async () => {
  [proxyA, proxyB] = await createGatewayProxy(
    'ws://localhost:8080',
    [definitionA, definitionB],
    customClientRequestResponse,
    customClientRequestStream
  );
});
afterAll(() => gateway.stop());

test(`Given microservices with customized gateway
    And   two service 
    And   two gateway-proxies created simultanously by createGatewayProxy method
    When  two requests executed through those proxies
    Then  two success responses returned by both of proxies`, async (done) => {
  const respA = await proxyA.methodA('hello');
  expect(respA).toEqual('custom cb used');
  const responses = ['hello_good_custom', 'hello_night_custom'];
  proxyB.methodB('hello').subscribe(
    (data) => {
      expect(data).toEqual(responses.shift());
    },
    (e) => {
      console.error(e);
    },
    done
  );
});
