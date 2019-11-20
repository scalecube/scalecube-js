import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { serviceCallError } from './ServiceCallUtils';
import { AddMessageToResponseOptions, InvokeMethodOptions, LocalCallOptions } from '../helpers/types';
import { getAsyncModelMissmatch, getMethodNotFoundError } from '../helpers/constants';

export const localCall = ({ localService, asyncModel, message, microserviceContext }: LocalCallOptions) => {
  const { reference, asyncModel: asyncModelProvider } = localService;
  const method = reference && reference[localService.methodName];

  if (!method) {
    return throwException(
      asyncModel,
      serviceCallError({
        errorMessage: getMethodNotFoundError(message),
        microserviceContext,
      })
    );
  }

  if (asyncModelProvider !== asyncModel) {
    return throwException(
      asyncModel,
      serviceCallError({
        errorMessage: getAsyncModelMissmatch(asyncModel, asyncModelProvider),
        microserviceContext,
      })
    );
  }

  const invoke = method(...message.data);

  if (typeof invoke !== 'object' || !invoke) {
    return throwException(
      asyncModel,
      serviceCallError({
        errorMessage: getIncorrectServiceInvoke(microserviceContext.whoAmI, message.qualifier),
        microserviceContext,
      })
    );
  }

  switch (asyncModel) {
    case ASYNC_MODEL_TYPES.REQUEST_STREAM:
      return new Observable((obs: any) => {
        check.isFunction(invoke.subscribe)
          ? invoke.subscribe((...data: any) => obs.next(...data), (err: Error) => obs.error(err), () => obs.complete())
          : obs.error(
              serviceCallError({
                errorMessage: getIncorrectServiceImplementForObservable(microserviceContext.whoAmI, message.qualifier),
                microserviceContext,
              })
            );
      });
    case ASYNC_MODEL_TYPES.REQUEST_RESPONSE:
      return new Promise((resolve, reject) => {
        check.isFunction(invoke.then)
          ? invoke.then(resolve).catch(reject)
          : reject(
              serviceCallError({
                errorMessage: getIncorrectServiceImplementForPromise(microserviceContext.whoAmI, message.qualifier),
                microserviceContext,
              })
            );
      });
    default:
      return throwException(
        asyncModel,
        serviceCallError({
          errorMessage: INVALID_ASYNC_MODEL,
          microserviceContext,
        })
      );
  }
};
