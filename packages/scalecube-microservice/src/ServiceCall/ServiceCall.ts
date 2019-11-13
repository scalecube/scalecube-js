import { Observable, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

import { MicroserviceApi, TransportApi } from '@scalecube/api';

import {
  ServiceCall,
  CreateServiceCallOptions,
  ServiceCallResponse,
  ServiceCallOptions,
  MicroserviceContext,
} from '../helpers/types';
import { validateMessage } from '../helpers/validation';
import { localCall } from './LocalCall';
import { remoteCall } from './RemoteCall';
import { MICROSERVICE_NOT_EXISTS, ASYNC_MODEL_TYPES } from '../helpers/constants';
import { defaultRouter } from '@scalecube/routers';
import { serviceCallError } from './ServiceCallUtils';

export const getServiceCall = ({
  router,
  microserviceContext,
  transportClientProvider,
}: CreateServiceCallOptions): ServiceCall => {
  return ({ message, asyncModel, messageFormat }: ServiceCallOptions): ServiceCallResponse => {
    try {
      validateMessage(message);
    } catch (e) {
      const err = serviceCallError({ errorMessage: e.message, microserviceContext });
      return asyncModel === ASYNC_MODEL_TYPES.REQUEST_RESPONSE ? Promise.reject(err) : throwError(err);
    }

    const localService = microserviceContext.localRegistry.lookUp({ qualifier: message.qualifier });
    const res$: Observable<any> = localService
      ? localCall({ localService, asyncModel, messageFormat, message, microserviceContext })
      : remoteCall({ router, microserviceContext, message, asyncModel, transportClientProvider });

    return asyncModel === ASYNC_MODEL_TYPES.REQUEST_RESPONSE ? res$.pipe(take(1)).toPromise() : res$;
  };
};

export const createServiceCall = ({
  router,
  microserviceContext,
  transportClientProvider,
}: {
  router: MicroserviceApi.Router;
  microserviceContext: MicroserviceContext | null;
  transportClientProvider?: TransportApi.Provider;
}) => {
  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }

  const serviceCall = getServiceCall({ router, microserviceContext, transportClientProvider });
  return Object.freeze({
    requestStream: (message: MicroserviceApi.Message, messageFormat: boolean = false) =>
      serviceCall({
        message,
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
        messageFormat,
      }),
    requestResponse: (message: MicroserviceApi.Message, messageFormat: boolean = false) =>
      serviceCall({
        message,
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
        messageFormat,
      }),
  });
};
