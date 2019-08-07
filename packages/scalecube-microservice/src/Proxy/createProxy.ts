import { TransportApi, MicroserviceApi } from '@scalecube/api';
import { MicroserviceContext } from '../helpers/types';
import { DUPLICATE_PROXY_NAME, MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { validateServiceDefinition } from '@scalecube/utils';
import { getProxy } from './Proxy';
import { getServiceCall } from '../ServiceCall/ServiceCall';
import { defaultRouter } from '@scalecube/routers';

export const createProxy = ({
  router = defaultRouter,
  serviceDefinition,
  microserviceContext,
  transportClientProvider,
}: {
  router?: MicroserviceApi.Router;
  serviceDefinition: MicroserviceApi.ServiceDefinition;
  microserviceContext: MicroserviceContext | null;
  transportClientProvider?: TransportApi.ClientProvider;
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
  createProxiesOptions: MicroserviceApi.CreateProxiesOptions;
  microserviceContext: MicroserviceContext | null;
  isServiceAvailable: any;
  transportClientProvider?: TransportApi.ClientProvider;
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
      });
    }

    return proxiesMap;
  }, {});
};
