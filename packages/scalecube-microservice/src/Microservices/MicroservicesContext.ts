import { Endpoint, LookupOptions, Reference } from '../api/public';
import { CreateRegistryOptions } from '../api/private/types';

export default interface MicroservicesContext {
  remoteRegistry: {
    addToServiceRegistry: ({ services }: CreateRegistryOptions) => any;
    lookUp: ({ qualifier }: LookupOptions) => Endpoint[] | [];
    destroy: () => null;
  };
  localRegistry: {
    lookUp: ({ qualifier }: LookupOptions) => Reference | null;
    addToMethodRegistry: ({ services }: CreateRegistryOptions) => any;
    destroy: () => null;
  };
}
