import { getQualifier } from '../helpers/serviceData';
import { isValidServiceDefinition } from '../helpers/serviceValidation';
import {
  getServiceIsNotValidError,
  getServiceMethodIsMissingError,
  SERVICE_DEFINITION_NOT_PROVIDED,
  SERVICE_NAME_NOT_PROVIDED,
} from '../helpers/constants';
export var getProxy = function(_a) {
  var serviceCall = _a.serviceCall,
    serviceDefinition = _a.serviceDefinition;
  if (!isValidServiceDefinition(serviceDefinition)) {
    if (!serviceDefinition) {
      throw new Error(SERVICE_DEFINITION_NOT_PROVIDED);
    }
    if (!serviceDefinition.serviceName) {
      throw new Error(SERVICE_NAME_NOT_PROVIDED);
    }
    throw new Error(getServiceIsNotValidError(serviceDefinition.serviceName));
  }
  return new Proxy(
    {},
    {
      get: preServiceCall({ serviceDefinition: serviceDefinition, serviceCall: serviceCall }),
    }
  );
};
var preServiceCall = function(_a) {
  var serviceCall = _a.serviceCall,
    serviceDefinition = _a.serviceDefinition;
  return function(target, prop) {
    if (!serviceDefinition.methods[prop]) {
      throw new Error(getServiceMethodIsMissingError(prop));
    }
    var asyncModel = serviceDefinition.methods[prop].asyncModel;
    return function() {
      var data = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        data[_i] = arguments[_i];
      }
      var message = {
        qualifier: getQualifier({ serviceName: serviceDefinition.serviceName, methodName: prop }),
        data: data,
      };
      return serviceCall({ message: message, asyncModel: asyncModel, includeMessage: false });
    };
  };
};
