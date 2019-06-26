import { Address, TransportApi } from '@scalecube/api';
import { TransportBrowser } from '@scalecube/transport-browser';
import { createDiscovery, Api as DiscoveryAPI } from '@scalecube/scalecube-discovery';
import { defaultRouter } from '../Routers/default';
import { getServiceCall } from '../ServiceCall/ServiceCall';
import { createServiceRegistry } from '../Registry/ServiceRegistry';
import { createMethodRegistry } from '../Registry/MethodRegistry';
import { MicroserviceContext } from '../helpers/types';
import { validateDiscoveryInstance, validateMicroserviceOptions } from '../helpers/validation';
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
import { startServer } from '../TransportProviders/MicroserviceServer';
import { isServiceAvailableInRegistry } from '../helpers/serviceData';
import { createProxies, createProxy } from '../Proxy/createProxy';

export const Microservices: MicroservicesInterface = Object.freeze({
  create: (options: MicroserviceOptions): Microservice => {
    const microserviceOptions = {
      services: [],
      discovery: createDiscovery,
      transport: TransportBrowser,
      ...options,
    };
    // TODO: add address, customTransport, customDiscovery  to the validation process
    validateMicroserviceOptions(microserviceOptions);
    const { services, seedAddress, address, transport, discovery } = microserviceOptions;
    const transportClientProvider = transport.clientProvider;

    // tslint:disable-next-line
    let microserviceContext: MicroserviceContext | null = createMicroserviceContext();
    const { methodRegistry, serviceRegistry } = microserviceContext;

    methodRegistry.add({ services, address });

    // if address is not available then microservice can't share services
    const endPointsToPublishInCluster = address
      ? serviceRegistry.createEndPoints({
          services,
          address,
        }) || []
      : [];

    const discoveryInstance: DiscoveryAPI.Discovery = createDiscoveryInstance({
      address,
      itemsToPublish: endPointsToPublishInCluster,
      seedAddress,
      discovery,
    });

    // server use only localCall therefor, router is irrelevant
    const defaultLocalCall = getServiceCall({
      router: defaultRouter,
      microserviceContext,
      transportClientProvider: transport.clientProvider,
    });
    // if address is not available then microservice can't start a server and get serviceCall requests
    address &&
      startServer({
        address,
        serviceCall: defaultLocalCall,
        transportServerProvider: transport.serverProvider,
      });
    options.gateway && options.gateway.start({ serviceCall: defaultLocalCall });

    discoveryInstance
      .discoveredItems$()
      .subscribe((discoveryEndpoints: any[]) => serviceRegistry.add({ endpoints: discoveryEndpoints as Endpoint[] }));

    const isServiceAvailable = isServiceAvailableInRegistry(
      endPointsToPublishInCluster,
      serviceRegistry,
      discoveryInstance
    );

    return Object.freeze({
      createProxies: (createProxiesOptions: CreateProxiesOptions) =>
        createProxies({ createProxiesOptions, microserviceContext, isServiceAvailable, transportClientProvider }),
      createProxy: (proxyOptions: ProxyOptions) =>
        createProxy({
          ...proxyOptions,
          microserviceContext,
          transportClientProvider,
        }),
      createServiceCall: ({ router }) => createServiceCall({ router, microserviceContext, transportClientProvider }),
      destroy: () => destroy({ microserviceContext, discovery }),
    } as Microservice);
  },
});

const createServiceCall = ({
  router = defaultRouter,
  microserviceContext,
  transportClientProvider,
}: {
  router?: Router;
  microserviceContext: MicroserviceContext | null;
  transportClientProvider: TransportApi.ClientProvider;
}) => {
  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }

  const serviceCall = getServiceCall({ router, microserviceContext, transportClientProvider });
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

const createDiscoveryInstance = (opt: {
  address?: Address;
  seedAddress?: Address;
  itemsToPublish: Endpoint[];
  discovery: (...data: any[]) => DiscoveryAPI.Discovery;
}): DiscoveryAPI.Discovery => {
  const { address, seedAddress, itemsToPublish, discovery } = opt;
  const discoveryInstance = discovery({
    address,
    itemsToPublish,
    seedAddress,
  });

  validateDiscoveryInstance(discoveryInstance);

  return discoveryInstance;
};
