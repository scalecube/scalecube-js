import { ServiceEndPoint } from '../api/Service';
import { generateIdentifier, isValidRawService } from '../helpers/utils';
import { getServiceName } from '../helpers/utils';

export const lookUp = ({ serviceRegistry, methodName }) => serviceRegistry[methodName];

export const updateServiceRegistry = ({ serviceRegistry, rawService }) => {
  if (isValidRawService(rawService)) {
    const services = servicesFromRawService(rawService);
    services.forEach((service) => addServiceToRegistry({ serviceRegistry, service }));
  }

  return { ...serviceRegistry };
};

const addServiceToRegistry = ({ serviceRegistry, service }) => {
  const nameSpace = `${getServiceName(service)} ${service.methodName}`;
  if (serviceRegistry[nameSpace]) {
    serviceRegistry[nameSpace] = {
      ...serviceRegistry[nameSpace],
      ...serviceEndPoint(service),
    };
  } else {
    serviceRegistry[nameSpace] = {
      ...serviceEndPoint(service),
    };
  }

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
  },
});

const servicesFromRawService = ({ rawService }): object[] => {
  const services: object[] = [];

  if (rawService.meta && rawService.meta.methods) {
    Object.keys(rawService.meta.methods).forEach((methodName) => {
      // raw meta - service with multiple methods
      const service = {
        identifier: `${generateIdentifier()}`,
        meta: {
          serviceName: getServiceName(rawService),
          [methodName]: rawService.meta.methods[methodName],
        },
        [methodName]: rawService[methodName].bind(rawService),
      };

      services.push(service);
    });
  } else {
    const service = {
      ...rawService,
      identifier: `${generateIdentifier()}`,
    };

    services.push(service);
  }

  return services;
};
