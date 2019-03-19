import {
  AvailableService,
  AvailableServices,
  GetUpdatedServiceRegistryOptions,
  ServiceRegistry,
  ServiceRegistryMap,
} from '../helpers/types';
import { Service, Endpoint } from '../api';
import { isValidServiceDefinition } from '../helpers/serviceValidation';
import { getQualifier } from '../helpers/serviceData';
import { MICROSERVICE_NOT_EXISTS, getServiceIsNotValidError } from '../helpers/constants';

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
      const endpoints = getEndpointsFromServices({ services }) as Endpoint[]; // all services => endPoints[]
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

export const getEndpointsFromServices = ({ services = [] }: AvailableServices): Endpoint[] | [] =>
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
    throw new Error(getServiceIsNotValidError(definition.serviceName));
  }

  return data;
};
