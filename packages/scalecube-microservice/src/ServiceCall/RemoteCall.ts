import { RemoteCallOptions } from '../api/private/types';
import { Observable, of } from 'rxjs6';
import { asyncModelTypes, throwErrorFromServiceCall } from '../helpers/utils';
import { Endpoint } from '../api/public';

export const remoteCall = ({ router, registry, message, asyncModel }: RemoteCallOptions): Observable<any> => {
  const endPoint: Endpoint = router.route({ registry, message });
  const { asyncModel: asyncModelProvider, transport } = endPoint;

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
