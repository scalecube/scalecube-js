import { Address, TransportApi, MicroserviceApi } from '@scalecube/api';
import { createDiscovery } from '@scalecube/scalecube-discovery';
import { check, getAddress, getFullAddress } from '@scalecube/utils';
import { createServiceCall } from '../ServiceCall/ServiceCall';
import { createRemoteRegistry } from '../Registry/RemoteRegistry';
import { createLocalRegistry } from '../Registry/LocalRegistry';
import { MicroserviceContext, MicroserviceContextOptions } from '../helpers/types';
import { validateDiscoveryInstance, validateMicroserviceOptions } from '../helpers/validation';
import { flatteningServices } from '../helpers/serviceData';
import { getServiceFactoryOptions, setMicroserviceInstance } from './MicroserviceInstance';
import { ROUTER_NOT_PROVIDED } from '../helpers/constants';
import { loggerUtil } from '../helpers/logger';
import { minimized } from './endpointsUtil';

export const createMicroservice: MicroserviceApi.CreateMicroservice = (
  options: MicroserviceApi.MicroserviceOptions
) => {
  let microserviceOptions = {
    defaultRouter: () => {
      throw new Error(ROUTER_NOT_PROVIDED);
    },
    services: [],
    debug: false,
    transport: {
      clientTransport: {
        start: () => {
          throw new Error('client transport not provided');
        },
      },
      serverTransport: () => {
        throw new Error('server transport not provided');
      },
    },
    ...options,
  };

  if (check.isString(microserviceOptions.address)) {
    microserviceOptions = { ...microserviceOptions, address: getAddress(microserviceOptions.address as string) };
  }

  microserviceOptions = {
    ...microserviceOptions,
    seedAddress: !!microserviceOptions.seedAddress
      ? (multiSeedSupport(microserviceOptions.seedAddress) as Address[])
      : microserviceOptions.seedAddress,
  };

  validateMicroserviceOptions(microserviceOptions);

  const { cluster, debug } = microserviceOptions;
  const transport = microserviceOptions.transport as TransportApi.Transport;
  const address = microserviceOptions.address as Address;
  const seedAddress = microserviceOptions.seedAddress as Address[];

  const transportClient = transport.clientTransport;
  const fallBackAddress = address || getAddress(Date.now().toString());

  // tslint:disable-next-line
  let microserviceContext: MicroserviceContext | null = createMicroserviceContext({
    address: fallBackAddress,
    debug: debug || false,
  });

  const { remoteRegistry, localRegistry } = microserviceContext;
  const serviceFactoryOptions = getServiceFactoryOptions({
    microserviceContext,
    transportClient,
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
    itemsToPublish: [minimized(endPointsToPublishInCluster)],
    seedAddress,
    cluster,
    debug,
  });

  discoveryInstance && validateDiscoveryInstance(discoveryInstance);

  // if address is not available then microservice can't start a server and get serviceCall requests
  const serverStop =
    address && transport
      ? transport.serverTransport({
          logger: loggerUtil(microserviceContext.whoAmI, microserviceContext.debug),
          localAddress: address,
          serviceCall: createServiceCall({
            router: microserviceOptions.defaultRouter,
            microserviceContext,
            transportClient,
          }),
        })
      : () => {};

  return setMicroserviceInstance({
    microserviceContext,
    transportClient,
    discoveryInstance,
    serverStop,
    debug,
    defaultRouter: microserviceOptions.defaultRouter,
  }) as MicroserviceApi.Microservice;
};

const createMicroserviceContext = ({ address, debug }: MicroserviceContextOptions) => {
  const remoteRegistry = createRemoteRegistry();
  const localRegistry = createLocalRegistry();
  return {
    remoteRegistry,
    localRegistry,
    debug,
    whoAmI: getFullAddress(address),
  };
};

const multiSeedSupport = (seedAddress: string | Address | string[] | Address[]) => {
  if (!check.isArray(seedAddress)) {
    return check.isString(seedAddress) ? [getAddress(seedAddress as string)] : [seedAddress];
  }
  return (seedAddress as []).map((val: string | Address) => (check.isString(val) ? getAddress(val as string) : val));
};
