import { Endpoint, LookupOptions, MethodRegistryDataStructure, Reference, ServiceRegistryDataStructure } from '.';
import { CreateRegistryOptions } from '../private/types';

export default interface Registry {
  lookUpRemote: ({ qualifier }: LookupOptions) => Endpoint[] | [];
  lookUpLocal: ({ qualifier }: LookupOptions) => Reference | null;
  AddToMethodRegistry: ({ services }: CreateRegistryOptions) => any;
  AddToServiceRegistry: ({ services }: CreateRegistryOptions) => any;
  destroy: () => null;
}
