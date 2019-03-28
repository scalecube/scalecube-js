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
import { isValidServiceDefinition } from '../helpers/serviceValidation';
import { getQualifier, getReferencePointer } from '../helpers/serviceData';
import { MICROSERVICE_NOT_EXISTS, getServiceIsNotValidError } from '../helpers/constants';
export var createMethodRegistry = function() {
  var methodRegistryMap = {};
  return Object.freeze({
    lookUp: function(_a) {
      var qualifier = _a.qualifier;
      if (!methodRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }
      return methodRegistryMap[qualifier] || null;
    },
    add: function(_a) {
      var _b = _a.services,
        services = _b === void 0 ? [] : _b,
        address = _a.address;
      if (!methodRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }
      var references = getReferenceFromServices({ services: services, address: address });
      methodRegistryMap = getUpdatedMethodRegistry({
        methodRegistryMap: methodRegistryMap,
        references: references,
      });
      return __assign({}, methodRegistryMap);
    },
    destroy: function() {
      methodRegistryMap = null;
      return null;
    },
  });
};
// Helpers
export var getReferenceFromServices = function(_a) {
  var _b = _a.services,
    services = _b === void 0 ? [] : _b,
    address = _a.address;
  return services.reduce(function(res, service) {
    return res.concat(
      getReferenceFromService({
        service: service,
        address: address,
      })
    );
  }, []);
};
export var getUpdatedMethodRegistry = function(_a) {
  var methodRegistryMap = _a.methodRegistryMap,
    references = _a.references;
  return __assign(
    {},
    methodRegistryMap,
    references.reduce(function(res, reference) {
      var _a;
      return __assign({}, res, ((_a = {}), (_a[reference.qualifier] = reference), _a));
    }, methodRegistryMap || {})
  );
};
export var getReferenceFromService = function(_a) {
  var service = _a.service,
    address = _a.address;
  var data = [];
  var definition = service.definition,
    reference = service.reference;
  if (isValidServiceDefinition(definition)) {
    var serviceName_1 = definition.serviceName,
      methods_1 = definition.methods;
    Object.keys(methods_1).forEach(function(methodName) {
      var _a;
      var qualifier = getQualifier({ serviceName: serviceName_1, methodName: methodName });
      data.push({
        qualifier: qualifier,
        serviceName: serviceName_1,
        methodName: methodName,
        asyncModel: methods_1[methodName].asyncModel,
        reference: ((_a = {}),
        (_a[methodName] = getReferencePointer({ reference: reference, methodName: methodName, qualifier: qualifier })),
        _a),
      });
    });
  } else {
    throw new Error(getServiceIsNotValidError(definition.serviceName));
  }
  return data;
};
