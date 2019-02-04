import { updateServiceRegistry } from './ServiceRegistry';

const addServices = ({ services, serviceRegistry }) => {
  return services.map((rawService) =>
    updateServiceRegistry({
      rawService,
      serviceRegistry,
    })
  );
};

const addServicesAsync = ({ services, serviceRegistry }) => {
  // TODO implement addServicesAsync
  return { ...serviceRegistry };
};

export { addServices, addServicesAsync };
