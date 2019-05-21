import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { throwErrorFromServiceCall } from '../helpers/utils';
import { AddMessageToResponseOptions, InvokeMethodOptions, LocalCallOptions } from '../helpers/types';
import { getAsyncModelMissmatch, getMethodNotFoundError, ASYNC_MODEL_TYPES } from '../helpers/constants';

export const localCall = ({ localService, asyncModel, includeMessage, message }: LocalCallOptions): Observable<any> => {
  const { reference, asyncModel: asyncModelProvider } = localService;
  const method = reference && reference[localService.methodName];

  if (asyncModelProvider !== asyncModel) {
    return throwErrorFromServiceCall({
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      errorMessage: getAsyncModelMissmatch(asyncModel, asyncModelProvider),
    }) as Observable<any>;
  }

  return method
    ? invokeMethod({ method, message }).pipe(addMessageToResponse({ includeMessage, message }))
    : (throwErrorFromServiceCall({
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
        errorMessage: `${getMethodNotFoundError(message)}`,
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
