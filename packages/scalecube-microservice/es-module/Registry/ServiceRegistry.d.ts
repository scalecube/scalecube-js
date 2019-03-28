import {
  AvailableService,
  AvailableServices,
  GetUpdatedServiceRegistryOptions,
  ServiceRegistry,
  ServiceRegistryMap,
} from '../helpers/types';
import { Endpoint } from '../api';
export declare const createServiceRegistry: () => ServiceRegistry;
export declare const getEndpointsFromServices: ({ services, address }: AvailableServices) => Endpoint[] | [];
export declare const getUpdatedServiceRegistry: ({
  serviceRegistryMap,
  endpoints,
}: GetUpdatedServiceRegistryOptions) => ServiceRegistryMap;
export declare const getEndpointsFromService: ({ service, address }: AvailableService) => Endpoint[];
