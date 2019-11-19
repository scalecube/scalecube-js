import { MicroserviceApi, TransportApi } from '@scalecube/api';
import { Observable } from 'rxjs';
import { RemoteCallOptions } from '../helpers/types';
import {
  getNotFoundByRouterError,
  TRANSPORT_NOT_PROVIDED,
  getAsyncModelMissmatch,
  ASYNC_MODEL_TYPES,
} from '../helpers/constants';
import { serviceCallError } from './ServiceCallUtils';
import { loggerUtil } from '../helpers/logger';

export const remoteCall = (options: RemoteCallOptions) => {
  const { asyncModel, transportClient, microserviceContext, message } = options;
  const logger = loggerUtil(microserviceContext.whoAmI, microserviceContext.debug);

  switch (asyncModel) {
    case ASYNC_MODEL_TYPES.REQUEST_STREAM:
      return new Observable((obs: any) => {
        getValidEndpoint(options)
          .then((endpoint: MicroserviceApi.Endpoint) => {
            transportClient
              .start({ remoteAddress: endpoint.address, logger })
              .then(({ requestStream }: TransportApi.RequestHandler) => {
                requestStream(message).subscribe(obs);
              })
              .catch((error: Error) => obs.error(error));
          })
          .catch((error: Error) => obs.error(error));
      });

    case ASYNC_MODEL_TYPES.REQUEST_RESPONSE:
      return new Promise((resolve, reject) => {
        getValidEndpoint(options)
          .then((endpoint: MicroserviceApi.Endpoint) => {
            transportClient
              .start({ remoteAddress: endpoint.address, logger })
              .then(({ requestResponse }: TransportApi.RequestHandler) => {
                requestResponse(message)
                  .then((response) => resolve(response))
                  .catch((e: Error) => reject(e));
              })
              .catch((e: Error) => reject(e));
          })
          .catch((e: Error) => reject(e));
      });
    default:
      throw new Error('invalid async model');
  }
};

const getValidEndpoint = ({ router, microserviceContext, message, asyncModel, transportClient }: RemoteCallOptions) =>
  new Promise<MicroserviceApi.Endpoint>((resolve, reject) => {
    router({ lookUp: microserviceContext.remoteRegistry.lookUp, message })
      .then((endPoint: MicroserviceApi.Endpoint) => {
        const { asyncModel: asyncModelProvider } = endPoint;

        if (asyncModelProvider !== asyncModel) {
          reject(
            serviceCallError({
              errorMessage: getAsyncModelMissmatch(asyncModel, asyncModelProvider),
              microserviceContext,
            })
          );
        }

        if (!transportClient) {
          reject(
            serviceCallError({
              errorMessage: TRANSPORT_NOT_PROVIDED,
              microserviceContext,
            })
          );
        }

        resolve(endPoint);
      })
      .catch(() => {
        reject(
          serviceCallError({
            errorMessage: getNotFoundByRouterError(microserviceContext.whoAmI, message.qualifier),
            microserviceContext,
          })
        );
      });
  });
