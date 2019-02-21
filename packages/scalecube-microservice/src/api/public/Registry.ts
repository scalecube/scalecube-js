import { Endpoint, LookupOptions, Reference } from '.';
import { CreateRegistryOptions } from '../private/types';

export default interface Registry {
  lookUpRemote: ({ qualifier }: LookupOptions) => Endpoint[] | [];
  lookUpLocal: ({ qualifier }: LookupOptions) => Reference;
  AddToMethodRegistry: ({ services }: CreateRegistryOptions) => any;
  AddToServiceRegistry: ({ services }: CreateRegistryOptions) => any;
}
