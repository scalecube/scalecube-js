export var MICROSERVICE_NOT_EXISTS = 'microservice does not exists';
export var MESSAGE_NOT_PROVIDED = 'Message has not been provided';
export var SERVICE_DEFINITION_NOT_PROVIDED = '(serviceDefinition) is not defined';
export var SERVICE_NAME_NOT_PROVIDED = '(serviceDefinition.serviceName) is not defined';
export var WRONG_DATA_FORMAT_IN_MESSAGE = 'Message format error: data must be Array';
export var getServiceIsNotValidError = function(serviceName) {
  return 'service ' + serviceName + ' is not valid.';
};
export var getServiceMethodIsMissingError = function(methodName) {
  return "service method '" + methodName + "' missing in the serviceDefinition";
};
export var getNotFoundByRouterError = function(qualifier) {
  return "can't find services with the request: '" + JSON.stringify(qualifier) + "'";
};
export var getAsyncModelMissmatch = function(expectedAsyncModel, receivedAsyncModel) {
  return 'asyncModel miss match, expect ' + expectedAsyncModel + ', but received ' + receivedAsyncModel;
};
export var getMethodNotFoundError = function(message) {
  return "Can't find method " + message.qualifier;
};
export var getInvalidMethodReferenceError = function(qualifier) {
  return 'Invalid method reference for ' + qualifier;
};
export var ASYNC_MODEL_TYPES = {
  REQUEST_RESPONSE: 'RequestResponse',
  REQUEST_STREAM: 'RequestStream',
};
