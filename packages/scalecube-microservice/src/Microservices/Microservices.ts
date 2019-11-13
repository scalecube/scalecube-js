import { Address, TransportApi, MicroserviceApi } from '@scalecube/api';
import { createDiscovery } from '@scalecube/scalecube-discovery';
import { TransportBrowser } from '@scalecube/transport-browser';
import { check, getAddress, getFullAddress, isNodejs } from '@scalecube/utils';
import { getServiceCall } from '../ServiceCall/ServiceCall';
import { createRemoteRegistry } from '../Registry/RemoteRegistry';
import { createLocalRegistry } from '../Registry/LocalRegistry';
import { MicroserviceContext, MicroserviceContextOptions } from '../helpers/types';
import { validateDiscoveryInstance, validateMicroserviceOptions } from '../helpers/validation';
import { startServer } from '../TransportProviders/MicroserviceServer';
import { flatteningServices } from '../helpers/serviceData';
import { createConnectionManager } from '../TransportProviders/ConnectionManager';
import { getServiceFactoryOptions, setMicroserviceInstance } from './MicroserviceInstance';
import { ROUTER_NOT_PROVIDED } from '../helpers/constants';

export const createMicroservice: MicroserviceApi.CreateMicroservice = (
  options: MicroserviceApi.MicroserviceOptions
) => {
  let microserviceOptions = {
    defaultRouter: () => {
      throw new Error(ROUTER_NOT_PROVIDED);
    },
    services: [],
    debug: false,
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
  const { cluster, debug } = microserviceOptions;
  const transport = microserviceOptions.transport as TransportApi.Transport;
  const address = microserviceOptions.address as Address;
  const seedAddress = microserviceOptions.seedAddress as Address;

  const transportClientProvider = transport && transport.clientProvider;
  const fallBackAddress = address || getAddress(Date.now().toString());

  // tslint:disable-next-line
  let microserviceContext: MicroserviceContext | null = createMicroserviceContext({
    address: fallBackAddress,
    debug: debug || false,
    connectionManager,
  });

  const { remoteRegistry, localRegistry } = microserviceContext;
  const serviceFactoryOptions = getServiceFactoryOptions({
    microserviceContext,
    transportClientProvider,
    defaultRouter: microserviceOptions.defaultRouter,
  });
  const services = microserviceOptions
    ? flatteningServices({
        services: microserviceOptions.services,
        serviceFactoryOptions,
      })
    : [];

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

  // if address is not available then microservice can't start a server and get serviceCall requests
  const serverStop =
    address && transport
      ? startServer({
          address,
          // server use only localCall therefor, router is irrelevant
          serviceCall: getServiceCall({
            router: microserviceOptions.defaultRouter,
            microserviceContext,
            transportClientProvider,
          }),
          transportServerProvider: transport.serverProvider,
          debug,
          whoAmI: getFullAddress(fallBackAddress),
        })
      : null;

  return setMicroserviceInstance({
    microserviceContext,
    transportClientProvider,
    discoveryInstance,
    serverStop,
    address: fallBackAddress,
    debug,
    endPointsToPublishInCluster,
    defaultRouter: microserviceOptions.defaultRouter,
  }) as MicroserviceApi.Microservice;
};

const createMicroserviceContext = ({ address, debug, connectionManager }: MicroserviceContextOptions) => {
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
