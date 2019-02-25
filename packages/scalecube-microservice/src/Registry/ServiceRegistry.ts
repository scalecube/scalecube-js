import {
  AvailableService,
  AvailableServices,
  GetUpdatedServiceRegistryOptions,
  ServiceRegistry,
} from '../api/private/types';
import { Service, LookupOptions, Endpoint, ServiceRegistryMap } from '../api/public';
import { isValidServiceDefinition } from '../helpers/serviceValidation';
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
    add: ({ services = [] }) => {
      if (!serviceRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }

      serviceRegistryMap = getUpdatedServiceRegistry({
        serviceRegistryMap,
        endpoints: getEndpointsFromServices({ services }) as Endpoint[], // all services => endPoints[]
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

export const getEndpointsFromServices = ({ services }: { services: Service[] }): Endpoint[] =>
  services.reduce((res: Endpoint[], service: Service) => [...res, ...getEndpointsFromService({ service })], []);

export const getUpdatedServiceRegistry = ({
  serviceRegistryMap,
  endpoints,
}: GetUpdatedServiceRegistryOptions): ServiceRegistryMap => ({
  ...serviceRegistryMap,
  ...endpoints.reduce(
    (res: ServiceRegistryMap, endpoint: Endpoint) => ({
      ...res,
      [endpoint.qualifier]: [...(res[endpoint.qualifier] || []), endpoint],
    }),
    serviceRegistryMap || {}
  ),
});

export const getEndpointsFromService = ({ service }: AvailableService): Endpoint[] => {
  let data: Endpoint[] = [];
  const { definition } = service;
  const transport = 'window:/';

  if (isValidServiceDefinition(definition)) {
    const { serviceName, methods } = definition;

    data = Object.keys(methods).map((methodName: string) => ({
      qualifier: getQualifier({ serviceName, methodName }),
      serviceName,
      methodName,
      asyncModel: methods[methodName].asyncModel,
      transport,
      uri: `${transport}/${serviceName}/${methodName}`,
    }));
  } else {
    throw new Error(`service ${definition.serviceName} is not valid.`);
  }

  return data;
};
