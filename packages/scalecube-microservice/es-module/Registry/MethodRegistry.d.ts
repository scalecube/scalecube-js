import {
  AvailableService,
  AvailableServices,
  GetUpdatedMethodRegistryOptions,
  MethodRegistry,
  MethodRegistryMap,
} from '../helpers/types';
import { Reference } from '../api';
export declare const createMethodRegistry: () => MethodRegistry;
export declare const getReferenceFromServices: ({ services, address }: AvailableServices) => [] | Reference[];
export declare const getUpdatedMethodRegistry: ({
  methodRegistryMap,
  references,
}: GetUpdatedMethodRegistryOptions) => MethodRegistryMap;
export declare const getReferenceFromService: ({ service, address }: AvailableService) => Reference[];
