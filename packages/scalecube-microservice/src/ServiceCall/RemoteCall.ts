import { MicroserviceApi } from '@scalecube/api';
import { Observable } from 'rxjs';
import { RemoteCallOptions } from '../helpers/types';
import {
  getNotFoundByRouterError,
  ASYNC_MODEL_TYPES,
  TRANSPORT_NOT_PROVIDED,
  getAsyncModelMissmatch,
} from '../helpers/constants';
import { remoteResponse } from '../TransportProviders/MicroserviceClient';
import { throwErrorFromServiceCall } from './ServiceCallUtils';

export const remoteCall = ({
  router,
  microserviceContext,
  message,
  asyncModel,
  transportClientProvider,
}: RemoteCallOptions): Observable<any> => {
  const endPoint: MicroserviceApi.Endpoint | null = router({
    lookUp: microserviceContext.remoteRegistry.lookUp,
    message,
  });
  if (!endPoint) {
    return throwErrorFromServiceCall({
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      errorMessage: getNotFoundByRouterError(microserviceContext.whoAmI, message.qualifier),
      microserviceContext,
    }) as Observable<any>;
  }
  const { asyncModel: asyncModelProvider } = endPoint!;

  if (asyncModelProvider !== asyncModel) {
    return throwErrorFromServiceCall({
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      errorMessage: getAsyncModelMissmatch(asyncModel, asyncModelProvider),
      microserviceContext,
    }) as Observable<any>;
  }

  if (!transportClientProvider) {
    return throwErrorFromServiceCall({
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      errorMessage: TRANSPORT_NOT_PROVIDED,
      microserviceContext,
    }) as Observable<any>;
  }

  return remoteResponse({
    address: endPoint.address,
    asyncModel,
    message,
    transportClientProvider,
    microserviceContext,
  });
};
