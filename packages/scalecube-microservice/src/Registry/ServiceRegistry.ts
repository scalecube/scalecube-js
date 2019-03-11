import {
  AvailableService,
  AvailableServices,
  GetUpdatedServiceRegistryOptions,
  ServiceRegistry,
  ServiceRegistryMap,
} from '../api/private/types';
import { Service, Endpoint } from '../api/public';
import { isValidServiceDefinition } from '../helpers/serviceValidation';
import { getQualifier } from '../helpers/serviceData';
import { MICROSERVICE_NOT_EXISTS, getServiceIsNotValidError } from '../helpers/constants';

export const createServiceRegistry = (): ServiceRegistry => {
  let serviceRegistryMap: ServiceRegistryMap|null = {};

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

      return getEndpointsFromServices({ services , address }) as Endpoint[]; // all services => endPoints[]
    },
    add: ({ endpoints = [] }: {endpoints: Endpoint[]}) => {
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

export const getEndpointsFromServices = ({ services = [], address }: AvailableServices): Endpoint[]|[] =>
  services.reduce((res: Endpoint[], service: Service) => [...res, ...getEndpointsFromService({ service, address })], []);

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
      address
    }));
  } else {
    throw new Error(getServiceIsNotValidError(definition.serviceName));
  }

  return data;
};
