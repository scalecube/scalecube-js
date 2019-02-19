import { LookUpRequest, ServiceEndPointResponse } from '../api/Service';

import { generateUUID } from '../helpers/utils';
import { getServiceMeta, getServiceName, getServiceNamespace } from '../helpers/serviceData';
import { isValidRawService } from '../helpers/serviceValidation';
import {
  AddServicesToRegistryOptions,
  GetServicesFromRawServiceOptions,
  GetUpdatedServiceRegistryOptions,
} from '../api2/private/types';
import { ServiceRegistry, RawService } from '../api2/public';

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
    getServicesFromRawService({ rawService }).forEach((service: object) =>
      addServiceToRegistry({ serviceRegistry: immutableServiceRegistry, service })
    );
  }

  return immutableServiceRegistry;
};

export const getServicesFromRawService = ({ rawService }: GetServicesFromRawServiceOptions): object[] => {
  const services: object[] = [];
  const meta = getServiceMeta(rawService);

  meta &&
    meta.methods &&
    Object.keys(meta.methods).forEach((methodName) => {
      // raw meta - service with multiple methods
      services.push({
        identifier: meta.identifier || `${generateUUID()}`,
        meta: {
          serviceName: getServiceName(rawService),
          methodName,
          ...meta.methods[methodName],
        },
        [methodName]: rawService[methodName],
      });
    });

  return services;
};

export const addServiceToRegistry = ({ serviceRegistry, service }) => {
  const nameSpace = getServiceNamespace(service);
  serviceRegistry[nameSpace] = {
    ...(serviceRegistry[nameSpace] || {}),
    ...serviceEndPoint({ service }),
  };

  return serviceRegistry;
};

export const serviceEndPoint = ({ service }): ServiceEndPointResponse => ({
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
