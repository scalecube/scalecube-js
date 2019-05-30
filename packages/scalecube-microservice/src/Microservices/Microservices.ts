import uuidv4 from 'uuid/v4';
import createDiscovery from '@scalecube/scalecube-discovery';
import { defaultRouter } from '../Routers/default';
import { getServiceCall } from '../ServiceCall/ServiceCall';
import { createServiceRegistry } from '../Registry/ServiceRegistry';
import { createMethodRegistry } from '../Registry/MethodRegistry';
import { MicroserviceContext } from '../helpers/types';
import { validateMicroserviceOptions } from '../helpers/validation';
import {
  Endpoint,
  Message,
  Microservice,
  MicroserviceOptions,
  Microservices as MicroservicesInterface,
  ProxyOptions,
  Router,
  CreateProxiesOptions,
} from '../api';
import { ASYNC_MODEL_TYPES, MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { createServer } from '../TransportProviders/MicroserviceServer';
import { isServiceAvailableInRegistry } from '../helpers/serviceData';
import { createProxies, createProxy } from '../Proxy/createProxy';

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

    const isServiceAvailable = isServiceAvailableInRegistry(endPointsToPublishInCluster, serviceRegistry, discovery);

    return Object.freeze({
      createProxies: (createProxiesOptions: CreateProxiesOptions) =>
        createProxies({ createProxiesOptions, microserviceContext, isServiceAvailable }),
      createProxy: (proxyOptions: ProxyOptions) => createProxy({ ...proxyOptions, microserviceContext }),
      createServiceCall: ({ router }) => createServiceCall({ router, microserviceContext }),
      destroy: () => destroy({ microserviceContext, discovery }),
    } as Microservice);
  },
});

const createServiceCall = ({
  router = defaultRouter,
  microserviceContext,
}: {
  router?: Router;
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
