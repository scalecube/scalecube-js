import { MicroserviceApi } from '@scalecube/api';
import { Observable } from 'rxjs';
import { RemoteCallOptions } from '../helpers/types';
import { getNotFoundByRouterError, TRANSPORT_NOT_PROVIDED, getAsyncModelMissmatch } from '../helpers/constants';
import { remoteResponse } from '../TransportProviders/MicroserviceClient';
import { serviceCallError } from './ServiceCallUtils';

export const remoteCall = ({
  router,
  microserviceContext,
  message,
  asyncModel,
  transportClientProvider,
}: RemoteCallOptions): Observable<any> => {
  return new Observable((obs: any) => {
    router({ lookUp: microserviceContext.remoteRegistry.lookUp, message })
      .then((endPoint: MicroserviceApi.Endpoint) => {
        const { asyncModel: asyncModelProvider } = endPoint;

        if (asyncModelProvider !== asyncModel) {
          obs.error(
            serviceCallError({
              errorMessage: getAsyncModelMissmatch(asyncModel, asyncModelProvider),
              microserviceContext,
            })
          );
        }

        if (!transportClientProvider) {
          obs.error(
            serviceCallError({
              errorMessage: TRANSPORT_NOT_PROVIDED,
              microserviceContext,
            })
          );
        } else {
          remoteResponse({
            address: endPoint.address,
            asyncModel,
            message,
            transportClientProvider,
            microserviceContext,
          }).subscribe(obs);
        }
      })
      .catch(() => {
        obs.error(
          serviceCallError({
            errorMessage: getNotFoundByRouterError(microserviceContext.whoAmI, message.qualifier),
            microserviceContext,
          })
        );
      });
  });
};
