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

    if (!method) {
      throw serviceCallError({
        errorMessage: getMethodNotFoundError(message),
        microserviceContext,
      });
    }

    if (asyncModelProvider !== asyncModel) {
      obs.error(
        serviceCallError({
          errorMessage: getAsyncModelMissmatch(asyncModel, asyncModelProvider),
          microserviceContext,
        })
      );
    }

    const invoke = method(...message.data);

    switch (asyncModel) {
      case ASYNC_MODEL_TYPES.REQUEST_STREAM:
        typeof invoke.subscribe === 'function'
          ? invoke.subscribe((...data: any) => obs.next(...data), (err: Error) => obs.error(err), () => obs.complete())
          : obs.error(
              serviceCallError({
                errorMessage: getIncorrectServiceImplementForObservable(microserviceContext.whoAmI, message.qualifier),
                microserviceContext,
              })
            );
        break;
      case ASYNC_MODEL_TYPES.REQUEST_RESPONSE:
        typeof invoke.then === 'function'
          ? invoke
              .then((...data: any) => {
                obs.next(...data);
              })
              .catch((error: any) => {
                obs.error(error);
              })
          : obs.error(
              serviceCallError({
                errorMessage: getIncorrectServiceImplementForPromise(microserviceContext.whoAmI, message.qualifier),
                microserviceContext,
              })
            );
        break;
      default:
        throw new Error('invalid async model');
    }
  });
