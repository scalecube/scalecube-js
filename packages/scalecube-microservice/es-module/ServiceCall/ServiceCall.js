import { throwErrorFromServiceCall } from '../helpers/utils';
import { MESSAGE_NOT_PROVIDED, ASYNC_MODEL_TYPES } from '../helpers/constants';
import { localCall } from './LocalCall';
import { remoteCall } from './RemoteCall';
export var getServiceCall = function(_a) {
  var router = _a.router,
    microserviceContext = _a.microserviceContext;
  return function(_a) {
    var message = _a.message,
      asyncModel = _a.asyncModel,
      includeMessage = _a.includeMessage;
    if (!message) {
      return throwErrorFromServiceCall({ asyncModel: asyncModel, errorMessage: MESSAGE_NOT_PROVIDED });
    }
    var localService = microserviceContext.methodRegistry.lookUp({ qualifier: message.qualifier });
    var res$ = localService
      ? localCall({
          localService: localService,
          asyncModel: asyncModel,
          includeMessage: includeMessage,
          message: message,
        })
      : remoteCall({
          router: router,
          microserviceContext: microserviceContext,
          message: message,
          asyncModel: asyncModel,
        });
    return asyncModel === ASYNC_MODEL_TYPES.REQUEST_RESPONSE ? res$.toPromise() : res$;
  };
};
