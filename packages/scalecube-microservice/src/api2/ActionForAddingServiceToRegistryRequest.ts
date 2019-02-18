import { GeneralService, ServiceRegistry } from '.';

export default interface ActionForAddingServiceToRegistryRequest {
  services?: GeneralService[];
  serviceRegistry: ServiceRegistry;
  isLazy?: boolean;
}
