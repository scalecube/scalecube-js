import uuidv4 from 'uuid/v4';
import createDiscovery from '@scalecube/scalecube-discovery';
import { defaultRouter } from '../Routers/default';
import { getProxy } from '../Proxy/Proxy';
import { getServiceCall } from '../ServiceCall/ServiceCall';
import { createServiceRegistry } from '../Registry/ServiceRegistry';
import { createMethodRegistry } from '../Registry/MethodRegistry';
import { ASYNC_MODEL_TYPES, MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
export var Microservices = Object.freeze({
  create: function(_a) {
    var services = _a.services,
      _b = _a.seedAddress,
      seedAddress = _b === void 0 ? 'defaultSeedAddress' : _b;
    var address = uuidv4();
    var microserviceContext = createMicroserviceContext();
    var methodRegistry = microserviceContext.methodRegistry,
      serviceRegistry = microserviceContext.serviceRegistry;
    services && Array.isArray(services) && methodRegistry.add({ services: services, address: address });
    var endPointsToPublishInCluster =
      services && Array.isArray(services)
        ? serviceRegistry.createEndPoints({
            services: services,
            address: address,
          })
        : [];
    var discovery = createDiscovery({
      address: address,
      itemsToPublish: endPointsToPublishInCluster,
      seedAddress: seedAddress,
    });
    discovery.discoveredItems$().subscribe(function(discoveryEndpoints) {
      return serviceRegistry.add({ endpoints: discoveryEndpoints });
    });
    return Object.freeze({
      createProxy: function(_a) {
        var _b = _a.router,
          router = _b === void 0 ? defaultRouter : _b,
          serviceDefinition = _a.serviceDefinition;
        if (!microserviceContext) {
          throw new Error(MICROSERVICE_NOT_EXISTS);
        }
        return getProxy({
          serviceCall: getServiceCall({ router: router, microserviceContext: microserviceContext }),
          serviceDefinition: serviceDefinition,
        });
      },
      createServiceCall: function(_a) {
        var _b = _a.router,
          router = _b === void 0 ? defaultRouter : _b;
        if (!microserviceContext) {
          throw new Error(MICROSERVICE_NOT_EXISTS);
        }
        var serviceCall = getServiceCall({ router: router, microserviceContext: microserviceContext });
        return Object.freeze({
          requestStream: function(message) {
            return serviceCall({
              message: message,
              asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
              includeMessage: true,
            });
          },
          requestResponse: function(message) {
            return serviceCall({
              message: message,
              asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
              includeMessage: true,
            });
          },
        });
      },
      destroy: function() {
        if (!microserviceContext) {
          throw new Error(MICROSERVICE_NOT_EXISTS);
        }
        discovery && discovery.destroy();
        Object.values(microserviceContext).forEach(function(contextEntity) {
          return typeof contextEntity.destroy === 'function' && contextEntity.destroy();
        });
        microserviceContext = null;
        return microserviceContext;
      },
    });
  },
});
export var createMicroserviceContext = function() {
  var serviceRegistry = createServiceRegistry();
  var methodRegistry = createMethodRegistry();
  return {
    serviceRegistry: serviceRegistry,
    methodRegistry: methodRegistry,
  };
};
