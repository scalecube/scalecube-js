import createDiscovery from '@scalecube/scalecube-discovery';
import { defaultRouter } from '../Routers/default';
import { getProxy } from '../Proxy/Proxy';
import { getServiceCall } from '../ServiceCall/ServiceCall';
import { isNodeEnv, uuidv4 } from '../helpers/utils'
import { createServiceRegistry } from '../Registry/ServiceRegistry';
import { createMethodRegistry } from '../Registry/MethodRegistry';
import { MicroserviceContext } from '../helpers/types';
import { Endpoint, Message, Microservice, MicroserviceOptions, Microservices as MicroservicesInterface } from '../api';
import { ASYNC_MODEL_TYPES, MICROSERVICE_NOT_EXISTS } from '../helpers/constants';

export const Microservices: MicroservicesInterface = Object.freeze({
  create: ({ services, seedAddress = isNodeEnv() ? 'clusterAddress' : location.hostname }: MicroserviceOptions): Microservice => {
    const address = uuidv4();

    let microserviceContext: MicroserviceContext|null = createMicroserviceContext();
    const { methodRegistry, serviceRegistry } = microserviceContext;
    services && Array.isArray(services) && methodRegistry.add({ services, address });

    const endPointsToPublishInCluster = services && Array.isArray(services) ? serviceRegistry.createEndPoints({
      services,
      address
    }) : [];

    const discovery = createDiscovery({
      address,
      itemsToPublish: endPointsToPublishInCluster,
      seedAddress,
    });

    discovery.discoveredItems$().subscribe((discoveryEndpoints) => serviceRegistry.add({ endpoints: discoveryEndpoints as Endpoint[] }));

    return Object.freeze({
      createProxy({ router = defaultRouter, serviceDefinition }) {
        if (!microserviceContext) {
          throw new Error(MICROSERVICE_NOT_EXISTS);
        }

        return getProxy({
          serviceCall: getServiceCall({ router, microserviceContext }),
          serviceDefinition,
        });
      },
      createServiceCall({ router = defaultRouter }) {
        if (!microserviceContext) {
          throw new Error(MICROSERVICE_NOT_EXISTS);
        }

        const serviceCall = getServiceCall({ router, microserviceContext });
        return Object.freeze({
          requestStream: (message: Message) =>
            serviceCall({
              message,
              asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
              includeMessage: true,
            }),
          requestResponse: (message: Message) =>
            serviceCall({
              message,
              asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
              includeMessage: true,
            }),
        });
      },
      destroy(): null {
        if (!microserviceContext) {
          throw new Error(MICROSERVICE_NOT_EXISTS);
        }

        discovery && discovery.destroy();

        Object.values(microserviceContext).forEach(
          (contextEntity) => typeof contextEntity.destroy === 'function' && contextEntity.destroy()
        );
        microserviceContext = null;

        return microserviceContext;
      },
    } as Microservice);
  },
});

export const createMicroserviceContext = () => {
  const serviceRegistry = createServiceRegistry();
  const methodRegistry = createMethodRegistry();
  return {
    serviceRegistry,
    methodRegistry,
  };
};
