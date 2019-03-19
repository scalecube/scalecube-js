import { Observable, of } from 'rxjs';
import { RemoteCallOptions } from '../api/private/types';
import { throwErrorFromServiceCall } from '../helpers/utils';
import { Endpoint } from '../api/public';
import { getNotFoundByRouterError, ASYNC_MODEL_TYPES } from '../helpers/constants';

export const remoteCall = ({
  router,
  microserviceContext,
  message,
  asyncModel,
}: RemoteCallOptions): Observable<any> => {
  const endPoint: Endpoint | null = router.route({ lookUp: microserviceContext.serviceRegistry.lookUp, message });
  if (!endPoint) {
    return throwErrorFromServiceCall({
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      errorMessage: getNotFoundByRouterError(message.qualifier),
    }) as Observable<any>;
  }
  const { asyncModel: asyncModelProvider } = endPoint!;

  if (asyncModelProvider !== asyncModel) {
    return throwErrorFromServiceCall({
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      errorMessage: `asyncModel miss match, expected ${asyncModel} but received ${asyncModelProvider}`,
    }) as Observable<any>;
  }

  // TODO remote invoke
  // TODO if service is remote then use transport else invoke the function
  return of({});
};
