import { Address, TransportApi, DiscoveryApi, MicroserviceApi } from '@scalecube/api';
import { createDiscovery } from '@scalecube/scalecube-discovery';
import { TransportBrowser } from '@scalecube/transport-browser';
import { defaultRouter } from '../Routers/default';
import { getServiceCall } from '../ServiceCall/ServiceCall';
import { createRemoteRegistry } from '../Registry/RemoteRegistry';
import { createLocalRegistry } from '../Registry/LocalRegistry';
import { ConnectionManager, MicroserviceContext } from '../helpers/types';
import { validateDiscoveryInstance, validateMicroserviceOptions } from '../helpers/validation';
import { ASYNC_MODEL_TYPES, MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { startServer } from '../TransportProviders/MicroserviceServer';
import { isServiceAvailableInRegistry } from '../helpers/serviceData';
import { createProxies, createProxy } from '../Proxy/createProxy';
import { check, getAddress, getFullAddress, saveToLogs } from '@scalecube/utils';
import { destroyAllClientConnections } from '../TransportProviders/MicroserviceClient';
import { createConnectionManager } from '../TransportProviders/ConnectionManager';
import { tap } from 'rxjs/operators';

export const createMicroservice: MicroserviceApi.CreateMicroservice = (
  options: MicroserviceApi.MicroserviceOptions
) => {
  let microserviceOptions = {
    services: [],
    discovery: createDiscovery,
    transport: TransportBrowser,
    ...options,
  };

  if (check.isString(microserviceOptions.address)) {
    microserviceOptions = { ...microserviceOptions, address: getAddress(microserviceOptions.address as string) };
  }

  if (check.isString(microserviceOptions.seedAddress)) {
    microserviceOptions = {
      ...microserviceOptions,
      seedAddress: getAddress(microserviceOptions.seedAddress as string),
    };
  }

  // TODO: add address, customTransport, customDiscovery  to the validation process
  validateMicroserviceOptions(microserviceOptions);

  const connectionManager = createConnectionManager();
  const { services, transport, discovery, debug } = microserviceOptions;
  const address = microserviceOptions.address as Address;
  const seedAddress = microserviceOptions.seedAddress as Address;

  const transportClientProvider = (transport as TransportApi.Transport).clientProvider;

  // tslint:disable-next-line
  let microserviceContext: MicroserviceContext | null = createMicroserviceContext();
  const { remoteRegistry, localRegistry } = microserviceContext;

  localRegistry.add({ services, address });

  // if address is not available then microservice can't share services
  const endPointsToPublishInCluster = address
    ? remoteRegistry.createEndPoints({
        services,
        address,
      }) || []
    : [];

  const fallBackAddress = address || getAddress(Date.now().toString());
  const discoveryInstance: DiscoveryApi.Discovery = createDiscoveryInstance({
    address: fallBackAddress,
    itemsToPublish: endPointsToPublishInCluster,
    seedAddress,
    discovery,
    debug,
  });

  // server use only localCall therefor, router is irrelevant
  const defaultLocalCall = getServiceCall({
    router: defaultRouter,
    microserviceContext,
    transportClientProvider,
    connectionManager,
  });

  // if address is not available then microservice can't start a server and get serviceCall requests
  const serverStop = address
    ? startServer({
        address,
        serviceCall: defaultLocalCall,
        transportServerProvider: (transport as TransportApi.Transport).serverProvider,
      })
    : null;

  const printLogs = () =>
    tap(
      ({ type, items }: DiscoveryApi.ServiceDiscoveryEvent) =>
        type !== 'IDLE' &&
        saveToLogs(
          getFullAddress(fallBackAddress),
          `microservice has been received an updated`,
          {
            [type]: [...items],
          },
          debug
        )
    );

  discoveryInstance
    .discoveredItems$()
    .pipe(printLogs())
    .subscribe(remoteRegistry.update);

  const isServiceAvailable = isServiceAvailableInRegistry(
    endPointsToPublishInCluster,
    remoteRegistry,
    discoveryInstance
  );

  return Object.freeze({
    createProxies: (createProxiesOptions: MicroserviceApi.CreateProxiesOptions) =>
      createProxies({
        createProxiesOptions,
        microserviceContext,
        isServiceAvailable,
        transportClientProvider,
        connectionManager,
      }),
    createProxy: (proxyOptions: MicroserviceApi.ProxyOptions) =>
      createProxy({
        ...proxyOptions,
        microserviceContext,
        transportClientProvider,
        connectionManager,
      }),
    createServiceCall: ({ router }: { router: MicroserviceApi.Router }) =>
      createServiceCall({
        router,
        microserviceContext,
        transportClientProvider,
        connectionManager,
      }),
    destroy: () => destroy({ microserviceContext, discovery: discoveryInstance, serverStop, connectionManager }),
  } as MicroserviceApi.Microservice);
};

const createServiceCall = ({
  router = defaultRouter,
  microserviceContext,
  transportClientProvider,
  connectionManager,
}: {
  router?: MicroserviceApi.Router;
  microserviceContext: MicroserviceContext | null;
  transportClientProvider: TransportApi.ClientProvider;
  connectionManager: ConnectionManager;
}) => {
  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }

  const serviceCall = getServiceCall({ router, microserviceContext, transportClientProvider, connectionManager });
  return Object.freeze({
    requestStream: (message: MicroserviceApi.Message, messageFormat: boolean = false) =>
      serviceCall({
        message,
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
        messageFormat,
      }),
    requestResponse: (message: MicroserviceApi.Message, messageFormat: boolean = false) =>
      serviceCall({
        message,
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
        messageFormat,
      }),
  });
};

const destroy = ({
  microserviceContext,
  discovery,
  serverStop,
  connectionManager,
}: {
  microserviceContext: MicroserviceContext | null;
  discovery: DiscoveryApi.Discovery;
  serverStop: any;
  connectionManager: ConnectionManager;
}) => {
  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }

  return new Promise((resolve, reject) => {
    if (microserviceContext) {
      const { localRegistry, remoteRegistry } = microserviceContext;
      localRegistry.destroy();
      remoteRegistry.destroy();
    }

    destroyAllClientConnections(connectionManager);
    serverStop && serverStop();

    discovery &&
      discovery.destroy().then(() => {
        microserviceContext = null;
        resolve('');
      });
  });
};

const createMicroserviceContext = () => {
  const remoteRegistry = createRemoteRegistry();
  const localRegistry = createLocalRegistry();
  return {
    remoteRegistry,
    localRegistry,
  };
};

const createDiscoveryInstance = (opt: {
  address: Address;
  seedAddress?: Address;
  itemsToPublish: MicroserviceApi.Endpoint[];
  discovery: DiscoveryApi.CreateDiscovery;
  debug?: boolean;
}): DiscoveryApi.Discovery => {
  const { seedAddress, itemsToPublish, discovery, debug, address } = opt;
  const discoveryInstance = discovery({
    address,
    itemsToPublish,
    seedAddress,
    debug,
  });

  validateDiscoveryInstance(discoveryInstance);

  return discoveryInstance;
};
