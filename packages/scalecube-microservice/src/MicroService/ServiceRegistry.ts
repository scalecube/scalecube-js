import { ServiceEndPoint } from '../api/Service';
import { generateIdentifier, isValidRawService } from '../helpers/utils';
import { getServiceName } from '../helpers/utils';

export const lookUp = ({ serviceRegistry, methodName }) => serviceRegistry[methodName];

export const updateServiceRegistry = ({ serviceRegistry, rawService }) => {
  if (isValidRawService(rawService)) {
    servicesFromRawService(rawService).forEach((service) => addServiceToRegistry({ serviceRegistry, service }));
  }

  return { ...serviceRegistry };
};

const addServiceToRegistry = ({ serviceRegistry, service }) => {
  const nameSpace = `${getServiceName(service)} ${service.methodName}`;

  serviceRegistry[nameSpace] = {
    ...(serviceRegistry[nameSpace] || {}),
    ...serviceEndPoint(service),
  };

  return { ...serviceRegistry };
};

const serviceEndPoint = (service): ServiceEndPoint => ({
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

const servicesFromRawService = ({ rawService }): object[] => {
  const services: object[] = [];

  if (rawService.meta && rawService.meta.methods) {
    Object.keys(rawService.meta.methods).forEach((methodName) => {
      // raw meta - service with multiple methods
      services.push({
        identifier: `${generateIdentifier()}`,
        meta: {
          serviceName: getServiceName(rawService),
          [methodName]: rawService.meta.methods[methodName],
        },
        [methodName]: rawService[methodName].bind(rawService),
      });
    });
  } else {
    services.push({
      ...rawService,
      identifier: `${generateIdentifier()}`,
    });
  }

  return services;
};
