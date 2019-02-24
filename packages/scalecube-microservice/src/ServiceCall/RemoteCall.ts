import { RemoteCallOptions, ServiceCallResponse } from '../api/private/types';
import { of } from 'rxjs6';
import { throwErrorFromServiceCall } from '../helpers/utils';
import { Endpoint } from '../api/public';

export const remoteCall = ({ router, registry, message, asyncModel }: RemoteCallOptions): ServiceCallResponse => {
  const endPoint: Endpoint = router.route({ registry, message });
  const { asyncModel: asyncModelProvider, transport } = endPoint;

  if (asyncModelProvider !== asyncModel) {
    return throwErrorFromServiceCall({
      asyncModel,
      errorMessage: `asyncModel miss match, expect ${asyncModel} but received ${asyncModelProvider}`,
    });
  }

  // TODO remote invoke
  // TODO if service is remote then use transport else invoke the function
  return of({});
};
