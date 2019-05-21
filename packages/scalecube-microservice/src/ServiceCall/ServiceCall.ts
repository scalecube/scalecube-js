import { Observable } from 'rxjs';
import { ServiceCall, CreateServiceCallOptions, ServiceCallResponse, ServiceCallOptions } from '../helpers/types';
import { isObject, isString, throwErrorFromServiceCall } from '../helpers/utils';
import {
  MESSAGE_NOT_PROVIDED,
  ASYNC_MODEL_TYPES,
  WRONG_DATA_FORMAT_IN_MESSAGE,
  QUALIFIER_IS_NOT_STRING,
} from '../helpers/constants';
import { localCall } from './LocalCall';
import { remoteCall } from './RemoteCall';
import { take } from 'rxjs/operators';

export const getServiceCall = ({ router, microserviceContext }: CreateServiceCallOptions): ServiceCall => {
  const openConnections = {};

  return ({ message, asyncModel, includeMessage }: ServiceCallOptions): ServiceCallResponse => {
    if (!message || !isObject(message)) {
      return throwErrorFromServiceCall({ asyncModel, errorMessage: MESSAGE_NOT_PROVIDED });
    }

    if (!message.data || !Array.isArray(message.data)) {
      return throwErrorFromServiceCall({ asyncModel, errorMessage: WRONG_DATA_FORMAT_IN_MESSAGE });
    }

    if (!message.qualifier || !isString(message.qualifier)) {
      return throwErrorFromServiceCall({ asyncModel, errorMessage: QUALIFIER_IS_NOT_STRING });
    }

    const localService = microserviceContext.methodRegistry.lookUp({ qualifier: message.qualifier });
    const res$: Observable<any> = localService
      ? localCall({ localService, asyncModel, includeMessage, message })
      : remoteCall({ router, microserviceContext, message, asyncModel, openConnections });

    return asyncModel === ASYNC_MODEL_TYPES.REQUEST_RESPONSE ? res$.pipe(take(1)).toPromise() : res$;
  };
};
