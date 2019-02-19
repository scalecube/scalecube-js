import { LookUpRequest, ServiceEndPointResponse } from '../api/Service';

import { generateUUID } from '../helpers/utils';
import { getServiceMeta, getServiceName, getServiceNamespace } from '../helpers/serviceData';
import { isValidRawService } from '../helpers/serviceValidation';
import {
  AddServicesToRegistryOptions,
  AddServiceToRegistryOptions,
  GetServicesFromRawServiceOptions,
  GetServiceWithEndPointOptions,
  GetUpdatedServiceRegistryOptions,
} from '../api2/private/types';
import { ServiceRegistry, RawService, Service } from '../api2/public';

export const lookUp = ({ serviceRegistry, namespace }: LookUpRequest) => serviceRegistry[namespace];

export const addServicesToRegistry = ({
  services = [],
  serviceRegistry,
}: AddServicesToRegistryOptions): ServiceRegistry => {
  services.forEach((rawService: RawService) => {
    serviceRegistry = getUpdatedServiceRegistry({
      serviceRegistry,
      rawService,
    });
  });

  return serviceRegistry;
};

export const getUpdatedServiceRegistry = ({
  serviceRegistry,
  rawService,
}: GetUpdatedServiceRegistryOptions): ServiceRegistry => {
  const immutableServiceRegistry = { ...serviceRegistry };
  if (isValidRawService(rawService)) {
    getServicesFromRawService({ rawService }).forEach((service: Service) =>
      addServiceToRegistry({ serviceRegistry: immutableServiceRegistry, service })
    );
  }

  return immutableServiceRegistry;
};

export const getServicesFromRawService = ({ rawService }: GetServicesFromRawServiceOptions): Service[] => {
  const services: Service[] = [];
  const serviceDefinition = getServiceMeta(rawService);

  serviceDefinition &&
    serviceDefinition.methods &&
    Object.keys(serviceDefinition.methods).forEach((methodName) => {
      // raw meta - service with multiple methods
      services.push({
        identifier: serviceDefinition.identifier || `${generateUUID()}`,
        serviceDefinition: {
          serviceName: getServiceName(rawService),
          methodName,
          ...serviceDefinition.methods[methodName],
        },
        [methodName]: rawService[methodName],
      });
    });

  return services;
};

export const addServiceToRegistry = ({ serviceRegistry, service }: AddServiceToRegistryOptions) => {
  const nameSpace = getServiceNamespace(service);
  serviceRegistry[nameSpace] = {
    ...(serviceRegistry[nameSpace] || {}),
    ...getServiceWithEndPoint({ service }),
  };

  return serviceRegistry;
};

export const getServiceWithEndPoint = ({ service }: GetServiceWithEndPointOptions): ServiceEndPointResponse => ({
  [service.identifier]: {
    id: '',
    host: '',
    port: 1,
    contentTypes: [],
    tags: {},
    serviceRegistrations: {},
    service,
  },
});
