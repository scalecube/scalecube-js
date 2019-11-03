import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { serviceCallError } from './ServiceCallUtils';
import { AddMessageToResponseOptions, InvokeMethodOptions, LocalCallOptions } from '../helpers/types';
import { getAsyncModelMissmatch, getMethodNotFoundError } from '../helpers/constants';

export const localCall = ({
  localService,
  asyncModel,
  messageFormat,
  message,
  microserviceContext,
}: LocalCallOptions): Observable<any> =>
  new Observable((obs: any) => {
    const { reference, asyncModel: asyncModelProvider } = localService;
    const method = reference && reference[localService.methodName];

    if (asyncModelProvider !== asyncModel) {
      obs.error(
        serviceCallError({
          errorMessage: getAsyncModelMissmatch(asyncModel, asyncModelProvider),
          microserviceContext,
        })
      );
    }

    method
      ? invokeMethod({ method, message })
          .pipe(addMessageToResponse({ messageFormat, message }))
          .subscribe(obs)
      : obs.error(
          serviceCallError({
            errorMessage: `${getMethodNotFoundError(message)}`,
            microserviceContext,
          })
        );
  });

export const invokeMethod = ({ method, message }: InvokeMethodOptions) => from(method(...message.data));

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
