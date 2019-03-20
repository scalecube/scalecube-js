import { Observable } from 'rxjs';
import { ServiceCall, CreateServiceCallOptions, ServiceCallResponse, ServiceCallOptions } from '../helpers/types';
import { throwErrorFromServiceCall } from '../helpers/utils';
import { MESSAGE_NOT_PROVIDED, ASYNC_MODEL_TYPES } from '../helpers/constants';
import { localCall } from './LocalCall';
import { remoteCall } from './RemoteCall';

export const getServiceCall = ({ router, microserviceContext }: CreateServiceCallOptions): ServiceCall => {
  return ({ message, asyncModel, includeMessage }: ServiceCallOptions): ServiceCallResponse => {
    if (!message) {
      return throwErrorFromServiceCall({ asyncModel, errorMessage: MESSAGE_NOT_PROVIDED });
    }

    const localService = microserviceContext.methodRegistry.lookUp({ qualifier: message.qualifier });
    const res$: Observable<any> = localService
      ? localCall({ localService, asyncModel, includeMessage, message })
      : remoteCall({ router, microserviceContext, message, asyncModel });

    return asyncModel === ASYNC_MODEL_TYPES.REQUEST_RESPONSE ? res$.toPromise() : res$;
  };
};
