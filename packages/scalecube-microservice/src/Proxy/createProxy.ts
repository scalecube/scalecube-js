import { TransportApi, MicroserviceApi } from '@scalecube/api';
import { ConnectionManager, MicroserviceContext } from '../helpers/types';
import { DUPLICATE_PROXY_NAME, MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { validateServiceDefinition } from '../helpers/validation';
import { getProxy } from './Proxy';
import { getServiceCall } from '../ServiceCall/ServiceCall';
import { defaultRouter } from '../Routers/default';

export const createProxy = ({
  router = defaultRouter,
  serviceDefinition,
  microserviceContext,
  transportClientProvider,
  connectionManager,
}: {
  router?: MicroserviceApi.Router;
  serviceDefinition: MicroserviceApi.ServiceDefinition;
  microserviceContext: MicroserviceContext | null;
  transportClientProvider: TransportApi.ClientProvider;
  connectionManager: ConnectionManager;
}) => {
  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }
  validateServiceDefinition(serviceDefinition);

  return getProxy({
    serviceCall: getServiceCall({ router, microserviceContext, transportClientProvider, connectionManager }),
    serviceDefinition,
  });
};

export const createProxies = ({
  createProxiesOptions,
  microserviceContext,
  isServiceAvailable,
  transportClientProvider,
  connectionManager,
}: {
  createProxiesOptions: MicroserviceApi.CreateProxiesOptions;
  microserviceContext: MicroserviceContext | null;
  isServiceAvailable: any;
  transportClientProvider: TransportApi.ClientProvider;
  connectionManager: ConnectionManager;
}): MicroserviceApi.ProxiesMap => {
  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }

  const { isAsync = false, proxies, router } = createProxiesOptions;

  return proxies.reduce((proxiesMap: MicroserviceApi.ProxiesMap, proxyOption: MicroserviceApi.ProxiesOptions) => {
    const { proxyName, serviceDefinition } = proxyOption;

    if (proxiesMap[proxyName]) {
      throw new Error(DUPLICATE_PROXY_NAME);
    }

    if (isAsync) {
      proxiesMap[proxyName] = new Promise((resolve, reject) => {
        try {
          const proxy = createProxy({
            serviceDefinition,
            router,
            microserviceContext,
            transportClientProvider,
            connectionManager,
          });
          isServiceAvailable(serviceDefinition).then(() => resolve({ proxy }));
        } catch (e) {
          reject(e);
        }
      });
    } else {
      proxiesMap[proxyName] = createProxy({
        serviceDefinition,
        router,
        microserviceContext,
        transportClientProvider,
        connectionManager,
      });
    }

    return proxiesMap;
  }, {});
};
