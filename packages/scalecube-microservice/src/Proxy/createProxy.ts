import { TransportApi } from '@scalecube/api';
import { CreateProxiesOptions, ProxiesMap, ProxiesOptions, Router, ServiceDefinition } from '../api';
import { MicroserviceContext } from '../helpers/types';
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
}: {
  router?: Router;
  serviceDefinition: ServiceDefinition;
  microserviceContext: MicroserviceContext | null;
  transportClientProvider: TransportApi.ClientProvider;
}) => {
  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }
  validateServiceDefinition(serviceDefinition);

  return getProxy({
    serviceCall: getServiceCall({ router, microserviceContext, transportClientProvider }),
    serviceDefinition,
  });
};

export const createProxies = ({
  createProxiesOptions,
  microserviceContext,
  isServiceAvailable,
  transportClientProvider,
}: {
  createProxiesOptions: CreateProxiesOptions;
  microserviceContext: MicroserviceContext | null;
  isServiceAvailable: (serviceDefinition: ServiceDefinition) => Promise<boolean>;
  transportClientProvider: TransportApi.ClientProvider;
}): ProxiesMap => {
  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }

  const { isAsync = false, proxies, router } = createProxiesOptions;

  return proxies.reduce((proxiesMap: ProxiesMap, proxyOption: ProxiesOptions) => {
    const { proxyName, serviceDefinition } = proxyOption;

    if (proxiesMap[proxyName]) {
      throw new Error(DUPLICATE_PROXY_NAME);
    }

    if (isAsync) {
      proxiesMap[proxyName] = new Promise((resolve, reject) => {
        try {
          const proxy = createProxy({ serviceDefinition, router, microserviceContext, transportClientProvider });
          isServiceAvailable(serviceDefinition).then(() => resolve({ proxy }));
        } catch (e) {
          reject(e);
        }
      });
    } else {
      proxiesMap[proxyName] = createProxy({ serviceDefinition, router, microserviceContext, transportClientProvider });
    }

    return proxiesMap;
  }, {});
};
