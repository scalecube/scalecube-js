import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { throwErrorFromServiceCall } from './ServiceCallUtils';
import { AddMessageToResponseOptions, InvokeMethodOptions, LocalCallOptions } from '../helpers/types';
import { getAsyncModelMissmatch, getMethodNotFoundError, ASYNC_MODEL_TYPES } from '../helpers/constants';

export const localCall = ({
  localService,
  asyncModel,
  messageFormat,
  message,
  microserviceContext,
}: LocalCallOptions): Observable<any> => {
  const { reference, asyncModel: asyncModelProvider } = localService;
  const method = reference && reference[localService.methodName];

  if (asyncModelProvider !== asyncModel) {
    return throwErrorFromServiceCall({
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      errorMessage: getAsyncModelMissmatch(asyncModel, asyncModelProvider),
      microserviceContext,
    }) as Observable<any>;
  }

  return method
    ? invokeMethod({ method, message }).pipe(addMessageToResponse({ messageFormat, message }))
    : (throwErrorFromServiceCall({
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
        errorMessage: `${getMethodNotFoundError(message)}`,
        microserviceContext,
      }) as Observable<any>);
};

export const invokeMethod = ({ method, message }: InvokeMethodOptions) => from(method(...message.data)).pipe();

export const addMessageToResponse = ({ messageFormat, message }: AddMessageToResponseOptions) =>
  map((response: any) => {
    if (messageFormat) {
      return {
        ...message,
        data: response,
      };
    }
    return response;
  });
