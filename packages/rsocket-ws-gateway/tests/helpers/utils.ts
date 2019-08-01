import { from, throwError } from 'rxjs';
import { createMicroservice, ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
import { Gateway } from '../../src/Gateway';

class ServiceA {
  public methodA() {
    return Promise.resolve({ id: 1 });
  }
  public methodB() {
    return Promise.reject({ code: 'ERR_NOT_FOUND', message: 'methodB error' });
  }
  public methodC() {
    return from([1, 2]);
  }
  // public methodD() {
  //   return throwError(new Error('methodD error'));
  // }
  public methodD() {
    return throwError({ code: 'ERR_NOT_FOUND', message: 'methodD error' });
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

export const runGateway = (port = 8080) => {
  const gateway = new Gateway({ port });
  const ms = createMicroservice({
    services: [{ definition, reference: new ServiceA() }],
    // gateway,
  });
  const serviceCall = ms.createServiceCall({});
  gateway.start({ serviceCall });
  return gateway;
};
