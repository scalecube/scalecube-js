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
  ProxyOptions,
  Router,
  Service,
  ServiceDefinition,
} from '../api';
import { ASYNC_MODEL_TYPES, MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { createServer } from '../TransportProviders/MicroserviceServer';

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

    return Object.freeze({
      createProxy: ({ router = defaultRouter, serviceDefinition }: ProxyOptions) =>
        createProxy({ router, serviceDefinition, microserviceContext }),
      createServiceCall: ({ router = defaultRouter }) => createServiceCall({ router, microserviceContext }),
      destroy: () => destroy({ microserviceContext, discovery }),
    } as Microservice);
  },
});

const createProxy = ({
  router,
  serviceDefinition,
  microserviceContext,
}: {
  router: Router;
  serviceDefinition: ServiceDefinition;
  microserviceContext: MicroserviceContext | null;
}) => {
  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }
  validateServiceDefinition(serviceDefinition);

  return getProxy({
    serviceCall: getServiceCall({ router, microserviceContext }),
    serviceDefinition,
  });
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
