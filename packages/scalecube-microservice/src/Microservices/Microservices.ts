import { Address, TransportApi, DiscoveryApi, MicroserviceApi } from '@scalecube/api';
import { createDiscovery } from '@scalecube/scalecube-discovery';
import { TransportBrowser } from '@scalecube/transport-browser';
import { check, getAddress, getFullAddress, saveToLogs, isNodejs } from '@scalecube/utils';
import { tap } from 'rxjs/operators';
import { defaultRouter } from '../Routers/default';
import { createServiceCall, getServiceCall } from '../ServiceCall/ServiceCall';
import { createRemoteRegistry } from '../Registry/RemoteRegistry';
import { createLocalRegistry } from '../Registry/LocalRegistry';
import { ConnectionManager, MicroserviceContext } from '../helpers/types';
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

  const transportClientProvider = transport && (transport as TransportApi.Transport).clientProvider;
  const fallBackAddress = address || getAddress(Date.now().toString());

  // tslint:disable-next-line
  let microserviceContext: MicroserviceContext | null = createMicroserviceContext({
    address: fallBackAddress,
    debug: debug || false,
    connectionManager,
  });
  const { remoteRegistry, localRegistry } = microserviceContext;

  localRegistry.add({ services, address });

  // if address is not available then microservice can't share services
  const endPointsToPublishInCluster = address
    ? remoteRegistry.createEndPoints({
        services,
        address,
      }) || []
    : [];

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
      }),
    createProxy: (proxyOptions: MicroserviceApi.ProxyOptions) =>
      createProxy({
        ...proxyOptions,
        microserviceContext,
        transportClientProvider,
      }),
    createServiceCall: ({ router }: { router: MicroserviceApi.Router }) =>
      createServiceCall({
        router,
        microserviceContext,
        transportClientProvider,
      }),
    destroy: () => destroy({ microserviceContext, discovery: discoveryInstance, serverStop }),
  } as MicroserviceApi.Microservice);
};

const createMicroserviceContext = ({
  address,
  debug,
  connectionManager,
}: {
  address: Address;
  debug: boolean;
  connectionManager: ConnectionManager;
}) => {
  const remoteRegistry = createRemoteRegistry();
  const localRegistry = createLocalRegistry();
  return {
    remoteRegistry,
    localRegistry,
    debug,
    whoAmI: getFullAddress(address),
    connectionManager,
  };
};
