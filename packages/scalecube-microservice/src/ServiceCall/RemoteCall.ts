import { MicroserviceApi } from '@scalecube/api';
import { Observable } from 'rxjs';
import { RemoteCallOptions } from '../helpers/types';
import { throwErrorFromServiceCall } from './ServiceCall';
import { getNotFoundByRouterError, ASYNC_MODEL_TYPES } from '../helpers/constants';
import { remoteResponse } from '../TransportProviders/MicroserviceClient';

export const remoteCall = ({
  router,
  microserviceContext,
  message,
  asyncModel,
  transportClientProvider,
}: RemoteCallOptions): Observable<any> => {
  const endPoint: MicroserviceApi.Endpoint | null = router.route({
    lookUp: microserviceContext.remoteRegistry.lookUp,
    message,
  });
  if (!endPoint) {
    return throwErrorFromServiceCall({
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      errorMessage: getNotFoundByRouterError(message.qualifier),
      microserviceContext,
    }) as Observable<any>;
  }
  const { asyncModel: asyncModelProvider } = endPoint!;

  if (asyncModelProvider !== asyncModel) {
    return throwErrorFromServiceCall({
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      errorMessage: `asyncModel is not correct, expected ${asyncModel} but received ${asyncModelProvider}`,
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
