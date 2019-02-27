import { localCall } from './LocalCall';
import { asyncModelTypes } from '../helpers/utils';
import { Message } from '../api/public';
import { of } from 'rxjs6';
import { catchError } from 'rxjs6/operators';
import { getQualifier } from '../helpers/serviceData';
import { methodNotFound } from '../helpers/constants';

describe('Test LocalCall', () => {
  const serviceName = 'fakeService';
  const methodName = 'hello';
  const qualifier = getQualifier({ serviceName, methodName });
  const localService = {
    reference: {
      hello: null,
    },
    asyncModel: asyncModelTypes.promise,
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
    localCall({ localService, asyncModel: asyncModelTypes.promise, includeMessage: true, message })
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
