import uuidv4 from 'uuid/v4';
import createDiscovery from '@scalecube/scalecube-discovery';
import { defaultRouter } from '../Routers/default';
import { getProxy } from '../Proxy/Proxy';
import { getServiceCall } from '../ServiceCall/ServiceCall';
import { createServiceRegistry } from '../Registry/ServiceRegistry';
import { createMethodRegistry } from '../Registry/MethodRegistry';
import { MicroserviceContext } from '../helpers/types';
import { validateMicroserviceOptions, validateServiceDefinition } from '../helpers/validation';
import {
  Endpoint,
  Message,
  Microservice,
  MicroserviceOptions,
  Microservices as MicroservicesInterface,
  ProxiesMap,
  ProxyOptions,
  Router,
  ServiceDefinition,
} from '../api';
import { ASYNC_MODEL_TYPES, MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { createServer } from '../TransportProviders/MicroserviceServer';
import { isServiceAvailableInRegistry } from '../helpers/serviceData';

export const Microservices: MicroservicesInterface = Object.freeze({
  create: (options: MicroserviceOptions): Microservice => {
    const microserviceOptions = { services: [], seedAddress: 'defaultSeedAddress', ...options };
    validateMicroserviceOptions(microserviceOptions);
    const { services, seedAddress } = microserviceOptions;
    const address = uuidv4();

    // tslint:disable-next-line
    let microserviceContext: MicroserviceContext | null = createMicroserviceContext();
    const { methodRegistry, serviceRegistry } = microserviceContext;

    methodRegistry.add({ services, address });

    const endPointsToPublishInCluster =
      serviceRegistry.createEndPoints({
        services,
        address,
      }) || [];

    const discovery = createDiscovery({
      address,
      itemsToPublish: endPointsToPublishInCluster,
      seedAddress,
    });

    const server = createServer({ address, microserviceContext });
    server.start();

    discovery
      .discoveredItems$()
      .subscribe((discoveryEndpoints: any[]) => serviceRegistry.add({ endpoints: discoveryEndpoints as Endpoint[] }));

    const isServiceAvailable = isServiceAvailableInRegistry(endPointsToPublishInCluster, discovery);

    return Object.freeze({
      requestProxies: (proxyOptions: ProxyOptions, router = defaultRouter) =>
        requestProxies({ router, proxyOptions, microserviceContext, isServiceAvailable }),
      createServiceCall: ({ router = defaultRouter }) => createServiceCall({ router, microserviceContext }),
      destroy: () => destroy({ microserviceContext, discovery }),
    } as Microservice);
  },
});

const requestProxies = ({
  router,
  proxyOptions,
  microserviceContext,
  isServiceAvailable,
}: {
  router: Router;
  proxyOptions: ProxyOptions;
  microserviceContext: MicroserviceContext | null;
  isServiceAvailable: (serviceDefinition: ServiceDefinition) => Promise<boolean>;
}): ProxiesMap => {
  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }

  return Object.keys(proxyOptions).reduce((proxies: ProxiesMap, proxyName: string) => {
    proxies[proxyName] = new Promise((resolve, reject) => {
      try {
        const serviceDefinition = proxyOptions[proxyName];
        validateServiceDefinition(serviceDefinition);

        const proxy = getProxy({
          serviceCall: getServiceCall({ router, microserviceContext }),
          serviceDefinition,
        });

        isServiceAvailable(serviceDefinition).then(() => resolve({ proxy }));
      } catch (e) {
        reject(e);
      }
    });

    return proxies;
  }, {});
};

const createServiceCall = ({
  router,
  microserviceContext,
}: {
  router: Router;
  microserviceContext: MicroserviceContext | null;
}) => {
  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }

  const serviceCall = getServiceCall({ router, microserviceContext });
  return Object.freeze({
    requestStream: (message: Message, messageFormat: boolean = false) =>
      serviceCall({
        message,
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
        includeMessage: messageFormat,
      }),
    requestResponse: (message: Message, messageFormat: boolean = false) =>
      serviceCall({
        message,
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
        includeMessage: messageFormat,
      }),
  });
};

const destroy = ({
  microserviceContext,
  discovery,
}: {
  microserviceContext: MicroserviceContext | null;
  discovery: any;
}) => {
  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }

  discovery && discovery.destroy();

  Object.values(microserviceContext).forEach(
    (contextEntity) => typeof contextEntity.destroy === 'function' && contextEntity.destroy()
  );
  microserviceContext = null;

  return microserviceContext;
};

const createMicroserviceContext = () => {
  const serviceRegistry = createServiceRegistry();
  const methodRegistry = createMethodRegistry();
  return {
    serviceRegistry,
    methodRegistry,
  };
};
