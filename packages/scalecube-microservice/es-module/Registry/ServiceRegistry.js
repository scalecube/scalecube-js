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
import { getQualifier } from '../helpers/serviceData';
import { MICROSERVICE_NOT_EXISTS, getServiceIsNotValidError } from '../helpers/constants';
export var createServiceRegistry = function() {
  var serviceRegistryMap = {};
  return Object.freeze({
    lookUp: function(_a) {
      var qualifier = _a.qualifier;
      if (!serviceRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }
      return serviceRegistryMap[qualifier] || [];
    },
    createEndPoints: function(_a) {
      var _b = _a.services,
        services = _b === void 0 ? [] : _b,
        address = _a.address;
      if (!serviceRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }
      return getEndpointsFromServices({ services: services, address: address }); // all services => endPoints[]
    },
    add: function(_a) {
      var _b = _a.endpoints,
        endpoints = _b === void 0 ? [] : _b;
      serviceRegistryMap = getUpdatedServiceRegistry({
        serviceRegistryMap: serviceRegistryMap,
        endpoints: endpoints,
      });
      return __assign({}, serviceRegistryMap);
    },
    destroy: function() {
      serviceRegistryMap = null;
      return null;
    },
  });
};
// Helpers
export var getEndpointsFromServices = function(_a) {
  var _b = _a.services,
    services = _b === void 0 ? [] : _b,
    address = _a.address;
  return services.reduce(function(res, service) {
    return res.concat(getEndpointsFromService({ service: service, address: address }));
  }, []);
};
export var getUpdatedServiceRegistry = function(_a) {
  var serviceRegistryMap = _a.serviceRegistryMap,
    endpoints = _a.endpoints;
  return __assign(
    {},
    endpoints.reduce(function(res, endpoint) {
      var _a;
      return __assign(
        {},
        res,
        ((_a = {}), (_a[endpoint.qualifier] = (res[endpoint.qualifier] || []).concat([endpoint])), _a)
      );
    }, serviceRegistryMap || {})
  );
};
export var getEndpointsFromService = function(_a) {
  var service = _a.service,
    address = _a.address;
  var data = [];
  var definition = service.definition;
  var transport = 'window:/';
  if (isValidServiceDefinition(definition)) {
    var serviceName_1 = definition.serviceName,
      methods_1 = definition.methods;
    data = Object.keys(methods_1).map(function(methodName) {
      return {
        qualifier: getQualifier({ serviceName: serviceName_1, methodName: methodName }),
        serviceName: serviceName_1,
        methodName: methodName,
        asyncModel: methods_1[methodName].asyncModel,
        transport: transport,
        uri: transport + '/' + serviceName_1 + '/' + methodName,
        address: address,
      };
    });
  } else {
    throw new Error(getServiceIsNotValidError(definition.serviceName));
  }
  return data;
};
