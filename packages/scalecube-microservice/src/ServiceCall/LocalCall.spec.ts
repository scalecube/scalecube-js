import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { localCall } from './LocalCall';
import { Message } from '../api';
import { getQualifier } from '../helpers/serviceData';
import { getMethodNotFoundError, ASYNC_MODEL_TYPES } from '../helpers/constants';

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
          expect(error.message).toMatch(`${getMethodNotFoundError(message)}`);
          done();
          return of({});
        })
      )
      .subscribe();
  });
});
