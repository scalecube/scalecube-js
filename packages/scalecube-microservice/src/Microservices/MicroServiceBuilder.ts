import { updateServiceRegistry } from './ServiceRegistry';
import { ActionForAddingServiceToRegistryRequest } from '../api2/public';

const addServices = ({ services = [], serviceRegistry, isLazy = false }: ActionForAddingServiceToRegistryRequest) => {
  services.forEach((rawService) => {
    serviceRegistry = updateServiceRegistry({
      rawService,
      serviceRegistry,
      isLazy,
    });
  });

  return serviceRegistry;
};

const addServicesLazy = ({ services, serviceRegistry }: ActionForAddingServiceToRegistryRequest) => {
  return addServices({ services, serviceRegistry, isLazy: true });
};

export { addServices, addServicesLazy };
