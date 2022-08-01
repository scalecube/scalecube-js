import { Address, DiscoveryApi, MicroserviceApi } from '@scalecube/api';
import {
  AvailableServices,
  CreateRemoteRegistry,
  RemoteRegistry,
  RemoteRegistryMap,
  UpdatedRemoteRegistry,
} from '../helpers/types';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { getQualifier, getFullAddress } from '@scalecube/utils';

export const createRemoteRegistry: CreateRemoteRegistry = (): RemoteRegistry => {
  let remoteRegistryMap: RemoteRegistryMap | null = {};

  return Object.freeze({
    lookUp: ({ qualifier }: MicroserviceApi.LookupOptions) => {
      if (!remoteRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }
      return remoteRegistryMap[qualifier] || [];
    },
    createEndPoints: (options: AvailableServices) => {
      if (!remoteRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }

      return getEndpointsFromServices(options) as MicroserviceApi.Endpoint[]; // all services => endPoints[]
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

export const getEndpointsFromServices = (options: AvailableServices): MicroserviceApi.Endpoint[] | [] => {
  const { services, address } = options;
  return services && address
    ? services.reduce(
        (res: MicroserviceApi.Endpoint[], service: MicroserviceApi.Service) => [
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
        (res: RemoteRegistryMap, endpoint: MicroserviceApi.Endpoint) => ({
          ...res,
          [endpoint.qualifier]: [...(res[endpoint.qualifier] || []), endpoint],
        }),
        remoteRegistryMap || {}
      );

      break;
    case 'UNREGISTERED':
      items.forEach((unregisteredEndpoint: MicroserviceApi.Endpoint) => {
        remoteRegistryMap[unregisteredEndpoint.qualifier] = remoteRegistryMap[unregisteredEndpoint.qualifier].filter(
          (registryEndpoint: MicroserviceApi.Endpoint) =>
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
}): MicroserviceApi.Endpoint[] => {
  const { definition } = service;
  const { serviceName, methods } = definition;
  return (
    Object.keys(methods).map((methodName: string) => ({
      qualifier: getQualifier({ serviceName, methodName }),
      serviceName,
      methodName,
      tags: methods[methodName].tags,
      asyncModel: methods[methodName].asyncModel,
      address,
    })) || []
  );
};
