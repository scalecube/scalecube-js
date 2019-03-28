import { of } from 'rxjs';
import { throwErrorFromServiceCall } from '../helpers/utils';
import { getNotFoundByRouterError, ASYNC_MODEL_TYPES } from '../helpers/constants';
export var remoteCall = function(_a) {
  var router = _a.router,
    microserviceContext = _a.microserviceContext,
    message = _a.message,
    asyncModel = _a.asyncModel;
  var endPoint = router.route({ lookUp: microserviceContext.serviceRegistry.lookUp, message: message });
  if (!endPoint) {
    return throwErrorFromServiceCall({
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      errorMessage: getNotFoundByRouterError(message.qualifier),
    });
  }
  var asyncModelProvider = endPoint.asyncModel;
  if (asyncModelProvider !== asyncModel) {
    return throwErrorFromServiceCall({
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      errorMessage: 'asyncModel is not correct, expected ' + asyncModel + ' but received ' + asyncModelProvider,
    });
  }
  // TODO remote invoke
  // TODO if service is remote then use transport else invoke the function
  return of({});
};
