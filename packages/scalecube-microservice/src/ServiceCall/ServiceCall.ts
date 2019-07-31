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
import { ASYNC_MODEL_TYPES } from '..';
import { localCall } from './LocalCall';
import { remoteCall } from './RemoteCall';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { defaultRouter } from '../Routers/default';
import { saveToLogs } from '@scalecube/utils';

export const getServiceCall = ({
  router,
  microserviceContext,
  transportClientProvider,
}: CreateServiceCallOptions): ServiceCall => {
  return ({ message, asyncModel, messageFormat }: ServiceCallOptions): ServiceCallResponse => {
    try {
      validateMessage(message);
    } catch (e) {
      return throwErrorFromServiceCall({ asyncModel, errorMessage: e.message, microserviceContext });
    }

    const localService = microserviceContext.localRegistry.lookUp({ qualifier: message.qualifier });
    const res$: Observable<any> = localService
      ? localCall({ localService, asyncModel, messageFormat, message, microserviceContext })
      : remoteCall({ router, microserviceContext, message, asyncModel, transportClientProvider });

    return asyncModel === ASYNC_MODEL_TYPES.REQUEST_RESPONSE ? res$.pipe(take(1)).toPromise() : res$;
  };
};

export const createServiceCall = ({
  router = defaultRouter,
  microserviceContext,
  transportClientProvider,
}: {
  router?: MicroserviceApi.Router;
  microserviceContext: MicroserviceContext | null;
  transportClientProvider?: TransportApi.ClientProvider;
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

export const throwErrorFromServiceCall = ({
  asyncModel,
  errorMessage,
  microserviceContext,
}: {
  asyncModel: MicroserviceApi.AsyncModel;
  errorMessage: string;
  microserviceContext: MicroserviceContext | null;
}) => {
  const error = new Error(errorMessage);
  if (microserviceContext) {
    const { whoAmI, debug } = microserviceContext;
    saveToLogs(whoAmI, errorMessage, {}, debug, 'warn');
  }
  return asyncModel === ASYNC_MODEL_TYPES.REQUEST_RESPONSE ? Promise.reject(error) : throwError(error);
};
