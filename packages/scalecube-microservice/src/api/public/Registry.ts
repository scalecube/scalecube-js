import { Endpoint, LookupOptions, MethodRegistryDataStructure, Reference, ServiceRegistryDataStructure } from '.';
import { CreateRegistryOptions } from '../private/types';
// make it private
export default interface Registry {
  lookUpRemote: ({ qualifier }: LookupOptions) => Endpoint[] | [];
  lookUpLocal: ({ qualifier }: LookupOptions) => Reference | null;
  addToMethodRegistry: ({ services }: CreateRegistryOptions) => any;
  addToServiceRegistry: ({ services }: CreateRegistryOptions) => any;
  destroy: () => null;
}
