import { Address, TransportApi, DiscoveryApi, MicroserviceApi } from '@scalecube/api';
import { createDiscovery } from '@scalecube/scalecube-discovery';
import { TransportBrowser } from '@scalecube/transport-browser';
import { check, getAddress, getFullAddress, saveToLogs, isNodejs } from '@scalecube/utils';
import { tap } from 'rxjs/operators';
import { defaultRouter } from '../Routers/default';
import { createServiceCall, getServiceCall } from '../ServiceCall/ServiceCall';
import { createRemoteRegistry } from '../Registry/RemoteRegistry';
import { createLocalRegistry } from '../Registry/LocalRegistry';
import { MicroserviceContext } from '../helpers/types';
import { validateDiscoveryInstance, validateMicroserviceOptions } from '../helpers/validation';
import { startServer } from '../TransportProviders/MicroserviceServer';
import { isServiceAvailableInRegistry } from '../helpers/serviceData';
import { createProxies, createProxy } from '../Proxy/createProxy';
import { createConnectionManager } from '../TransportProviders/ConnectionManager';
import { destroy } from './Destroy';

export const createMicroservice: MicroserviceApi.CreateMicroservice = (
  options: MicroserviceApi.MicroserviceOptions
) => {
  let microserviceOptions = {
    services: [],
    transport: !isNodejs() ? TransportBrowser : undefined,
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

  validateMicroserviceOptions(microserviceOptions);

  const connectionManager = createConnectionManager();
  const { services, transport, cluster, debug } = microserviceOptions;
  const address = microserviceOptions.address as Address;
  const seedAddress = microserviceOptions.seedAddress as Address;

  if (options && options.gateway) {
    const gatewayServiceCall = getServiceCall({
      router: options.gatewayRouter || defaultRouter,
      microserviceContext,
      transportClientProvider: transport.clientProvider,
    });
    options.gateway.start({ serviceCall: gatewayServiceCall });
  }
  const transportClientProvider = transport && (transport as TransportApi.Transport).clientProvider;

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
  const discoveryInstance = createDiscovery({
    address: fallBackAddress,
    itemsToPublish: endPointsToPublishInCluster,
    seedAddress,
    cluster,
    debug,
  });

  validateDiscoveryInstance(discoveryInstance);

  // server use only localCall therefor, router is irrelevant
  const defaultLocalCall = getServiceCall({
    router: defaultRouter,
    microserviceContext,
    transportClientProvider,
    connectionManager,
  });

  // if address is not available then microservice can't start a server and get serviceCall requests
  const serverStop =
    address && transport
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

const createMicroserviceContext = () => {
  const remoteRegistry = createRemoteRegistry();
  const localRegistry = createLocalRegistry();
  return {
    remoteRegistry,
    localRegistry,
  };
};
