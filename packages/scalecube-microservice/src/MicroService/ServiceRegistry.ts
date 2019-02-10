import { LookUpRequest, ServiceEndPointResponse } from '../api/Service';
import { generateUUID } from '../helpers/utils';
import { getServiceMeta, getServiceName, getServiceNamespace } from '../helpers/serviceData';
import { isValidRawService } from '../helpers/serviceValidation';

export const lookUp = ({ serviceRegistry, namespace }: LookUpRequest) => serviceRegistry[namespace];

export const updateServiceRegistry = ({ serviceRegistry, rawService }) => {
  const immutableServiceRegistry = { ...serviceRegistry };
  if (isValidRawService(rawService)) {
    servicesFromRawService({ rawService }).forEach((service) =>
      addServiceToRegistry({ serviceRegistry: immutableServiceRegistry, service })
    );
  }

  return immutableServiceRegistry;
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

export const servicesFromRawService = ({ rawService }): object[] => {
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
        [methodName]: rawService[methodName].bind(rawService),
      });
    });

  return services;
};
