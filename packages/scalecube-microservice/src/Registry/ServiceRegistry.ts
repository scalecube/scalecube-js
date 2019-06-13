import {
  AvailableService,
  AvailableServices,
  GetUpdatedServiceRegistryOptions,
  ServiceRegistry,
  ServiceRegistryMap,
} from '../helpers/types';
import { Service, Endpoint } from '../api';
import { getQualifier } from '../helpers/serviceData';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';

export const createServiceRegistry = (): ServiceRegistry => {
  let serviceRegistryMap: ServiceRegistryMap | null = {};

  return Object.freeze({
    lookUp: ({ qualifier }) => {
      if (!serviceRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }

      return serviceRegistryMap[qualifier] || [];
    },
    createEndPoints: ({ services = [], address }) => {
      if (!serviceRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }

      return getEndpointsFromServices({ services, address }) as Endpoint[]; // all services => endPoints[]
    },
    add: ({ endpoints = [] }: { endpoints: Endpoint[] }) => {
      serviceRegistryMap = getUpdatedServiceRegistry({
        serviceRegistryMap,
        endpoints,
      });
      return { ...serviceRegistryMap };
    },
    destroy: () => {
      serviceRegistryMap = null;
      return null;
    },
  } as ServiceRegistry);
};

// Helpers

export const getEndpointsFromServices = ({ services = [], address }: AvailableServices): Endpoint[] | [] =>
  services.reduce(
    (res: Endpoint[], service: Service) => [...res, ...getEndpointsFromService({ service, address })],
    []
  );

export const getUpdatedServiceRegistry = ({
  serviceRegistryMap,
  endpoints,
}: GetUpdatedServiceRegistryOptions): ServiceRegistryMap => ({
  ...endpoints.reduce(
    (res: ServiceRegistryMap, endpoint: Endpoint) => ({
      ...res,
      [endpoint.qualifier]: [...(res[endpoint.qualifier] || []), endpoint],
    }),
    serviceRegistryMap || {}
  ),
});

export const getEndpointsFromService = ({ service, address }: AvailableService): Endpoint[] => {
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
