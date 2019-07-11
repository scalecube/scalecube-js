import { DiscoveryApi, MicroserviceApi } from '@scalecube/api';
import {
  AvailableService,
  AvailableServices,
  GetUpdatedServiceRegistryOptions,
  ServiceRegistry,
  ServiceRegistryMap,
} from '../helpers/types';
import { getQualifier } from '../helpers/serviceData';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';

export const createServiceRegistry = (): ServiceRegistry => {
  let serviceRegistryMap: ServiceRegistryMap | null = {};

  return Object.freeze({
    lookUp: ({ qualifier }: MicroserviceApi.LookupOptions) => {
      if (!serviceRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }

      return serviceRegistryMap[qualifier] || [];
    },
    createEndPoints: ({ services = [], address }) => {
      if (!serviceRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }

      return getEndpointsFromServices({ services, address }) as MicroserviceApi.Endpoint[]; // all services => endPoints[]
    },
    update: ({ type, items }: DiscoveryApi.ServiceDiscoveryEvent) => {
      switch (type) {
        case 'REGISTERED':
          break;
        case 'UNREGISTERED':
          break;
      }
    },
    destroy: () => {
      serviceRegistryMap = null;
      return null;
    },
  } as ServiceRegistry);
};

// Helpers

export const getEndpointsFromServices = ({
  services = [],
  address,
}: AvailableServices): MicroserviceApi.Endpoint[] | [] =>
  services.reduce(
    (res: MicroserviceApi.Endpoint[], service: MicroserviceApi.Service) => [
      ...res,
      ...getEndpointsFromService({ service, address }),
    ],
    []
  );

export const getUpdatedServiceRegistry = ({
  serviceRegistryMap,
  endpoints,
}: GetUpdatedServiceRegistryOptions): ServiceRegistryMap => ({
  ...endpoints.reduce(
    (res: ServiceRegistryMap, endpoint: MicroserviceApi.Endpoint) => ({
      ...res,
      [endpoint.qualifier]: [...(res[endpoint.qualifier] || []), endpoint],
    }),
    serviceRegistryMap || {}
  ),
});

export const getEndpointsFromService = ({ service, address }: AvailableService): MicroserviceApi.Endpoint[] => {
  if (!address) {
    return [];
  }
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
