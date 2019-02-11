import { updateServiceRegistry } from './ServiceRegistry';

const addServices = ({ services, serviceRegistry, isLazy = false }) => {
  services.forEach((rawService) => {
    serviceRegistry = updateServiceRegistry({
      rawService,
      serviceRegistry,
      isLazy,
    });
  });

  return serviceRegistry;
};

const addServicesLazy = ({ services, serviceRegistry }) => {
  return addServices({ services, serviceRegistry, isLazy: true });
};

export { addServices, addServicesLazy };
