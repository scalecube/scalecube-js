import { Endpoint, LookupOptions, Reference } from '../api/public';
import { CreateRegistryOptions } from '../api/private/types';

export default interface MicroservicesContext {
  registry: {
    addToServiceRegistry: ({ services }: CreateRegistryOptions) => any;
    lookUpRemote: ({ qualifier }: LookupOptions) => Endpoint[] | [];
  };
  localRegisry: {
    lookUpLocal: ({ qualifier }: LookupOptions) => Reference | null;
    addToMethodRegistry: ({ services }: CreateRegistryOptions) => any;
  };
  destroy: () => null;
}
