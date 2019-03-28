var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
import { from, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { throwErrorFromServiceCall } from '../helpers/utils';
import {
  getAsyncModelMissmatch,
  getMethodNotFoundError,
  WRONG_DATA_FORMAT_IN_MESSAGE,
  ASYNC_MODEL_TYPES,
} from '../helpers/constants';
export var localCall = function(_a) {
  var localService = _a.localService,
    asyncModel = _a.asyncModel,
    includeMessage = _a.includeMessage,
    message = _a.message;
  var reference = localService.reference,
    asyncModelProvider = localService.asyncModel;
  var method = reference && reference[localService.methodName];
  if (asyncModelProvider !== asyncModel) {
    return throwErrorFromServiceCall({
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      errorMessage: getAsyncModelMissmatch(asyncModel, asyncModelProvider),
    });
  }
  if (!message.data || !Array.isArray(message.data)) {
    return throwError(new Error(WRONG_DATA_FORMAT_IN_MESSAGE));
  }
  return method
    ? invokeMethod({ method: method, message: message }).pipe(
        addMessageToResponse({ includeMessage: includeMessage, message: message })
      )
    : throwErrorFromServiceCall({
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
        errorMessage: '' + getMethodNotFoundError(message),
      });
};
export var invokeMethod = function(_a) {
  var method = _a.method,
    message = _a.message;
  return from(method.apply(void 0, message.data)).pipe();
};
export var addMessageToResponse = function(_a) {
  var includeMessage = _a.includeMessage,
    message = _a.message;
  return map(function(response) {
    if (includeMessage) {
      return __assign({}, message, { data: response });
    }
    return response;
  });
};
