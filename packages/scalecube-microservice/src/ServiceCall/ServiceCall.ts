import { Observable, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

import { MicroserviceApi, TransportApi } from '@scalecube/api';

import {
  ServiceCall,
  CreateServiceCallOptions,
  ServiceCallResponse,
  ServiceCallOptions,
  MicroserviceContext,
  ConnectionManager,
} from '../helpers/types';
import { throwErrorFromServiceCall } from '../helpers/utils';
import { validateMessage } from '../helpers/validation';
import { ASYNC_MODEL_TYPES } from '..';
import { localCall } from './LocalCall';
import { remoteCall } from './RemoteCall';
import { MICROSERVICE_NOT_EXISTS, TRANSPORT_NOT_PROVIDED } from '../helpers/constants';
import { defaultRouter } from '../Routers/default';

export const getServiceCall = ({
  router,
  microserviceContext,
  transportClientProvider,
  connectionManager,
}: CreateServiceCallOptions): ServiceCall => {
  return ({ message, asyncModel, messageFormat }: ServiceCallOptions): ServiceCallResponse => {
    try {
      validateMessage(message);
    } catch (e) {
      return throwErrorFromServiceCall({ asyncModel, errorMessage: e.message });
    }

    const localService = microserviceContext.localRegistry.lookUp({ qualifier: message.qualifier });
    const res$: Observable<any> = localService
      ? localCall({ localService, asyncModel, messageFormat, message })
      : transportClientProvider
      ? remoteCall({ router, microserviceContext, message, asyncModel, transportClientProvider, connectionManager })
      : throwError(TRANSPORT_NOT_PROVIDED);

    return asyncModel === ASYNC_MODEL_TYPES.REQUEST_RESPONSE ? res$.pipe(take(1)).toPromise() : res$;
  };
};

export const createServiceCall = ({
  router = defaultRouter,
  microserviceContext,
  transportClientProvider,
  connectionManager,
}: {
  router?: MicroserviceApi.Router;
  microserviceContext: MicroserviceContext | null;
  transportClientProvider?: TransportApi.ClientProvider;
  connectionManager: ConnectionManager;
}) => {
  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }

  const serviceCall = getServiceCall({ router, microserviceContext, transportClientProvider, connectionManager });
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
