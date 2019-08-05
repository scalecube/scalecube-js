import { Address, DiscoveryApi, Endpoint, LookupOptions, MicroserviceApi } from '@scalecube/api';
import {
  AvailableServices,
  CreateRemoteRegistry,
  RemoteRegistry,
  RemoteRegistryMap,
  UpdatedRemoteRegistry,
} from '../helpers/types';
import { getQualifier } from '../helpers/serviceData';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { getFullAddress } from '@scalecube/utils';

export const createRemoteRegistry: CreateRemoteRegistry = (): RemoteRegistry => {
  let remoteRegistryMap: RemoteRegistryMap | null = {};

  return Object.freeze({
    lookUp: ({ qualifier }: LookupOptions) => {
      if (!remoteRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }
      return remoteRegistryMap[qualifier] || [];
    },
    createEndPoints: (options: AvailableServices) => {
      if (!remoteRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }

      return getEndpointsFromServices(options) as Endpoint[]; // all services => endPoints[]
    },
    update: ({ type, items }: DiscoveryApi.ServiceDiscoveryEvent) => {
      if (type === 'IDLE') {
        return;
      }

      if (!remoteRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }

      remoteRegistryMap = updatedRemoteRegistry({ type, items, remoteRegistryMap });
    },
    destroy: () => {
      remoteRegistryMap = null;
    },
  });
};

// Helpers

export const getEndpointsFromServices = (options: AvailableServices): Endpoint[] | [] => {
  const { services, address } = options;
  return services && address
    ? services.reduce(
        (res: Endpoint[], service: MicroserviceApi.Service) => [
          ...res,
          ...getEndpointsFromService({ service, address }),
        ],
        []
      )
    : [];
};

export const updatedRemoteRegistry = ({ type, items, remoteRegistryMap }: UpdatedRemoteRegistry): RemoteRegistryMap => {
  switch (type) {
    case 'REGISTERED':
      remoteRegistryMap = items.reduce(
        (res: RemoteRegistryMap, endpoint: Endpoint) => ({
          ...res,
          [endpoint.qualifier]: [...(res[endpoint.qualifier] || []), endpoint],
        }),
        remoteRegistryMap || {}
      );

      break;
    case 'UNREGISTERED':
      items.forEach((unregisteredEndpoint: Endpoint) => {
        remoteRegistryMap[unregisteredEndpoint.qualifier] = remoteRegistryMap[unregisteredEndpoint.qualifier].filter(
          (registryEndpoint: Endpoint) =>
            getFullAddress(registryEndpoint.address) !== getFullAddress(unregisteredEndpoint.address)
        );
      });
      break;
  }

  return { ...remoteRegistryMap };
};

export const getEndpointsFromService = ({
  service,
  address,
}: {
  service: MicroserviceApi.Service;
  address: Address;
}): Endpoint[] => {
  const { definition } = service;
  const { serviceName, methods } = definition;
  return (
    Object.keys(methods).map((methodName: string) => ({
      qualifier: getQualifier({ serviceName, methodName }),
      serviceName,
      methodName,
      asyncModel: methods[methodName].asyncModel,
      address,
    })) || []
  );
};
