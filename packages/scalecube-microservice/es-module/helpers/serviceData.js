import { isFunction } from './utils';
import { getInvalidMethodReferenceError } from './constants';
export var getQualifier = function(_a) {
  var serviceName = _a.serviceName,
    methodName = _a.methodName;
  return serviceName + '/' + methodName;
};
export var getReferencePointer = function(_a) {
  var reference = _a.reference,
    methodName = _a.methodName,
    qualifier = _a.qualifier;
  var func;
  if (isFunction(reference)) {
    func = reference;
  } else {
    if (!isFunction(reference[methodName])) {
      // Check if method is static
      if (!isFunction(reference.constructor[methodName])) {
        throw new Error(getInvalidMethodReferenceError(qualifier));
      } else {
        func = reference.constructor[methodName];
      }
    } else {
      func = reference[methodName].bind(reference);
    }
  }
  return func;
};
