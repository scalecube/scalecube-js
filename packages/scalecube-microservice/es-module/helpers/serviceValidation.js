import { isObject } from './utils';
import { ASYNC_MODEL_TYPES } from './constants';
export var isValidServiceDefinition = function(definition) {
  return definition ? isValidServiceName(definition.serviceName) && isValidMethods(definition.methods) : false;
};
export var isValidServiceName = function(serviceName) {
  if (typeof serviceName !== 'string') {
    console.error(new Error('Service missing serviceName:string'));
    return false;
  }
  return true;
};
export var isValidMethods = function(methods) {
  if (!isObject(methods)) {
    console.error(new Error('Service missing methods:object'));
    return false;
  }
  return Object.keys(methods).every(function(methodName) {
    return isValidMethod({ methodData: methods[methodName], methodName: methodName });
  });
};
export var isValidMethod = function(_a) {
  var methodData = _a.methodData,
    methodName = _a.methodName;
  if (!isValidAsyncModel({ asyncModel: methodData.asyncModel })) {
    console.error(new Error('method ' + methodName + " doesn't contain valid  type (asyncModel)"));
    return false;
  }
  return true;
};
export var isValidAsyncModel = function(_a) {
  var asyncModel = _a.asyncModel;
  return Object.values(ASYNC_MODEL_TYPES).includes(asyncModel);
};
