import { of } from 'rxjs6';
import { catchError } from 'rxjs6/operators';
import { localCall } from './LocalCall';
import { Message } from '../api/public';
import { getQualifier } from '../helpers/serviceData';
import { methodNotFound, ASYNC_MODEL_TYPES } from '../helpers/constants';

describe('Test LocalCall', () => {
  const serviceName = 'fakeService';
  const methodName = 'hello';
  const qualifier = getQualifier({ serviceName, methodName });
  const localService = {
    reference: {
      hello: null,
    },
    asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
    methodName,
    qualifier,
    serviceName,
  };

  const message: Message = {
    data: [],
    qualifier,
  };

  it('Test fail to find a method', (done) => {
    // @ts-ignore
    localCall({ localService, asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE, includeMessage: true, message })
      .pipe(
        catchError((error: Error) => {
          expect(error.message).toMatch(`${methodNotFound(message)}`);
          done();
          return of({});
        })
      )
      .subscribe();
  });
});
