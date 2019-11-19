import { Observable, throwError } from 'rxjs';

import { MicroserviceApi } from '@scalecube/api';

import {
  ServiceCall,
  GetServiceCallOptions,
  ServiceCallResponse,
  ServiceCallOptions,
  CreateServiceCall,
} from '../helpers/types';
import { validateMessage } from '../helpers/validation';
import { localCall } from './LocalCall';
import { remoteCall } from './RemoteCall';
import { MICROSERVICE_NOT_EXISTS, ASYNC_MODEL_TYPES } from '../helpers/constants';
import { serviceCallError } from './ServiceCallUtils';

export const getServiceCall = (options: GetServiceCallOptions): ServiceCall => {
  const { router, microserviceContext, transportClient } = options;
  return ({ message, asyncModel }: ServiceCallOptions): ServiceCallResponse => {
    try {
      validateMessage(message);
    } catch (e) {
      const err = serviceCallError({ errorMessage: e.message, microserviceContext });
      return asyncModel === ASYNC_MODEL_TYPES.REQUEST_RESPONSE ? Promise.reject(err) : throwError(err);
    }

    const localService = microserviceContext.localRegistry.lookUp({ qualifier: message.qualifier });
    return localService
      ? localCall({ localService, asyncModel, message, microserviceContext })
      : remoteCall({ router, microserviceContext, message, asyncModel, transportClient });
  };
};

export const createServiceCall = (options: CreateServiceCall) => {
  const { router, microserviceContext, transportClient } = options;

  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }

  const serviceCall = getServiceCall({ router, microserviceContext, transportClient });

  return Object.freeze({
    requestStream: (message: MicroserviceApi.Message) =>
      serviceCall({
        message,
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      }) as Observable<any>,
    requestResponse: (message: MicroserviceApi.Message) =>
      serviceCall({
        message,
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      }) as Promise<any>,
  });
};
