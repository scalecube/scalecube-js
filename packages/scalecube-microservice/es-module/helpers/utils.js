import { throwError } from 'rxjs';
import { ASYNC_MODEL_TYPES } from './constants';
export var isObject = function(obj) {
  return obj && typeof obj === 'object' && obj.constructor === Object;
};
export var isFunction = function(obj) {
  return obj && obj instanceof Function;
};
export var throwErrorFromServiceCall = function(_a) {
  var asyncModel = _a.asyncModel,
    errorMessage = _a.errorMessage;
  var error = new Error(errorMessage);
  console.warn(errorMessage);
  return asyncModel === ASYNC_MODEL_TYPES.REQUEST_RESPONSE ? Promise.reject(error) : throwError(error);
};
export var getGlobalNamespace = function() {
  return typeof window === 'undefined' ? global : window;
};
