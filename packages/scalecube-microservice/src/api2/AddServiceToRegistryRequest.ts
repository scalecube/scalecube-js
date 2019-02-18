import { GeneralService, ServiceRegistry } from '.';
import { ActionForAddingServiceToRegistryRequest } from './ActionForAddingServiceToRegistryRequest';

export default interface AddServiceToRegistryRequest {
  services?: GeneralService[];
  serviceRegistry: ServiceRegistry;
  action: (actionRequest: ActionForAddingServiceToRegistryRequest) => ServiceRegistry;
}
