import { from, throwError, Observable } from 'rxjs6';
import { map } from 'rxjs6/operators';
import { asyncModelTypes, throwErrorFromServiceCall } from '../helpers/utils';
import { AddMessageToResponseOptions, InvokeMethodOptions, LocalCallOptions } from '../api/private/types';
import { getAsyncModelMissmatch, methodNotFound, WRONG_DATA_FORMAT_IN_MESSAGE } from '../helpers/constants';

export const localCall = ({ localService, asyncModel, includeMessage, message }: LocalCallOptions): Observable<any> => {
  const { reference, asyncModel: asyncModelProvider } = localService;
  const method = reference && reference[localService.methodName];

  if (asyncModelProvider !== asyncModel) {
    return throwErrorFromServiceCall({
      asyncModel: asyncModelTypes.observable,
      errorMessage: getAsyncModelMissmatch(asyncModel, asyncModelProvider),
    }) as Observable<any>;
  }

  if (!message.data || !Array.isArray(message.data)) {
    return throwError(new Error(WRONG_DATA_FORMAT_IN_MESSAGE));
  }

  return method
    ? invokeMethod({ method, message }).pipe(addMessageToResponse({ includeMessage, message }))
    : (throwErrorFromServiceCall({
        asyncModel: asyncModelTypes.observable,
        errorMessage: `${methodNotFound(message)}`,
      }) as Observable<any>);
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
