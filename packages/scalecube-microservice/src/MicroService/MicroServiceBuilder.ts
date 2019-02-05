import { updateServiceRegistry } from './ServiceRegistry';

const addServices = ({ services, serviceRegistry }) => {
  services.forEach(
    (rawService) =>
      (serviceRegistry = updateServiceRegistry({
        rawService,
        serviceRegistry,
      }))
  );

  return serviceRegistry;
};

const addServicesAsync = ({ services, serviceRegistry }) => {
  // TODO implement addServicesAsync
  return { ...serviceRegistry };
};

export { addServices, addServicesAsync };
