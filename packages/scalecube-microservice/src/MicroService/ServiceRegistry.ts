import { ServiceEndPoint } from '../api/Service';
import { generateIdentifier, getServiceMeta, isValidRawService } from '../helpers/utils';
import { getServiceName, getServiceNamespace } from '../helpers/utils';

export const lookUp = ({ serviceRegistry, namespace }) => serviceRegistry[namespace];

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

export const serviceEndPoint = ({ service }): ServiceEndPoint => ({
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
        identifier: `${generateIdentifier()}`,
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
