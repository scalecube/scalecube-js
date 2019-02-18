import { GeneralService, ServiceRegistry, ActionForAddingServiceToRegistryRequest } from '.';

export default interface AddServiceToRegistryRequest {
  services?: GeneralService[];
  serviceRegistry: ServiceRegistry;
  action: (actionRequest: ActionForAddingServiceToRegistryRequest) => ServiceRegistry;
}
