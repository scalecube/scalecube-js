import { RemoteCallOptions } from '../api/private/types';
import { Observable, of } from 'rxjs6';
import { asyncModelTypes, throwErrorFromServiceCall } from '../helpers/utils';
import { Endpoint } from '../api/public';
import { getNotFoundByRouterError } from '../helpers/constants';

export const remoteCall = ({
  router,
  microserviceContext,
  message,
  asyncModel,
}: RemoteCallOptions): Observable<any> => {
  const endPoint: Endpoint | null = router.route({ lookUp: microserviceContext.serviceRegistry.lookUp, message });
  if (!endPoint) {
    return throwErrorFromServiceCall({
      asyncModel: asyncModelTypes.observable,
      errorMessage: getNotFoundByRouterError(message.qualifier),
    }) as Observable<any>;
  }
  const { asyncModel: asyncModelProvider, transport } = endPoint!;

  if (asyncModelProvider !== asyncModel) {
    return throwErrorFromServiceCall({
      asyncModel: asyncModelTypes.observable,
      errorMessage: `asyncModel miss match, expect ${asyncModel} but received ${asyncModelProvider}`,
    }) as Observable<any>;
  }

  // TODO remote invoke
  // TODO if service is remote then use transport else invoke the function
  return of({});
};
