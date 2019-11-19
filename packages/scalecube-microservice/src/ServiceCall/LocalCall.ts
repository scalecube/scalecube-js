import { Observable } from 'rxjs';
import { serviceCallError } from './ServiceCallUtils';
import { LocalCallOptions } from '../helpers/types';
import {
  ASYNC_MODEL_TYPES,
  getAsyncModelMissmatch,
  getIncorrectServiceImplementForObservable,
  getIncorrectServiceImplementForPromise,
  getMethodNotFoundError,
} from '../helpers/constants';

export const localCall = ({ localService, asyncModel, message, microserviceContext }: LocalCallOptions) => {
  const { reference, asyncModel: asyncModelProvider } = localService;
  const method = reference && reference[localService.methodName];

  if (!method) {
    throw serviceCallError({
      errorMessage: getMethodNotFoundError(message),
      microserviceContext,
    });
  }

  switch (asyncModel) {
    case ASYNC_MODEL_TYPES.REQUEST_STREAM:
      return new Observable((obs: any) => {
        if (asyncModelProvider !== asyncModel) {
          obs.error(
            serviceCallError({
              errorMessage: getAsyncModelMissmatch(asyncModel, asyncModelProvider),
              microserviceContext,
            })
          );
        }

        const invoke = method(...message.data);

        typeof invoke.subscribe === 'function'
          ? invoke.subscribe(obs)
          : obs.error(
              serviceCallError({
                errorMessage: getIncorrectServiceImplementForObservable(microserviceContext.whoAmI, message.qualifier),
                microserviceContext,
              })
            );
      });
    case ASYNC_MODEL_TYPES.REQUEST_RESPONSE:
      return new Promise((resolve, reject) => {
        if (asyncModelProvider !== asyncModel) {
          reject(
            serviceCallError({
              errorMessage: getAsyncModelMissmatch(asyncModel, asyncModelProvider),
              microserviceContext,
            })
          );
        }
        const invoke = method(...message.data);

        typeof invoke.then === 'function'
          ? invoke.then(resolve).catch(reject)
          : reject(
              serviceCallError({
                errorMessage: getIncorrectServiceImplementForPromise(microserviceContext.whoAmI, message.qualifier),
                microserviceContext,
              })
            );
      });
    default:
      throw new Error('invalid async model');
  }
};

/*

const { reference, asyncModel: asyncModelProvider } = localService;
  const method = reference && reference[localService.methodName];

  const invokeMethod = () => new Observable((obs: any) => {
    if (asyncModelProvider !== asyncModel) {
      obs.error(
        serviceCallError({
          errorMessage: getAsyncModelMissmatch(asyncModel, asyncModelProvider),
          microserviceContext,
        })
      );
    }

    method
      ? from(method(...message.data)).subscribe(obs)
      : obs.error(serviceCallError({
        errorMessage: getMethodNotFoundError(message),
        microserviceContext,
      }));

  });
  switch (asyncModel) {
    case ASYNC_MODEL_TYPES.REQUEST_STREAM:
      return invokeMethod();
    case ASYNC_MODEL_TYPES.REQUEST_RESPONSE:
      return invokeMethod().toPromise();
    default:
      throw new Error('invalid async model')
  }


};


 */
