import { asyncModelTypes, throwErrorFromServiceCall } from '../helpers/utils';
import { from, Observable } from 'rxjs6';
import { map } from 'rxjs6/operators';
import { AddMessageToResponseOptions, InvokeMethodOptions, LocalCallOptions } from '../api/private/types';

export const localCall = ({ localService, asyncModel, includeMessage, message }: LocalCallOptions): Observable<any> => {
  const { reference, asyncModel: asyncModelProvider } = localService;
  const method = reference && reference[localService.methodName];

  if (asyncModelProvider !== asyncModel) {
    return throwErrorFromServiceCall({
      asyncModel: asyncModelTypes.observable,
      errorMessage: `asyncModel miss match, expect ${asyncModel} but received ${asyncModelProvider}`,
    }) as Observable<any>;
  }

  if (method) {
    return invokeMethod({ method, message }).pipe(addMessageToResponse({ includeMessage, message }));
  } else {
    return throwErrorFromServiceCall({
      asyncModel: asyncModelTypes.observable,
      errorMessage: `Can't find method ${message.qualifier}`,
    }) as Observable<any>;
  }
};

export const invokeMethod = ({ method, message }: InvokeMethodOptions) => from(method(...message.data)).pipe();

export const addMessageToResponse = ({ includeMessage, message }: AddMessageToResponseOptions) =>
  map((response: any) => {
    if (includeMessage) {
      return {
        ...message,
        data: response,
      };
    }
    return response;
  });
