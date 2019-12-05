import { Provider } from '@scalecube/rsocket-adapter';
import { clientFactory } from './ProviderClient';
import { serverFactory } from './ProviderServer';

const serializers = {
  data: {
    deserialize: (data: any) => data,
    serialize: (data: any) => data,
  },
  metadata: {
    deserialize: (data: any) => data,
    serialize: (data: any) => data,
  },
};

export const clientProvider: Provider = {
  providerFactory: clientFactory,
  serializers,
  factoryOptions: null,
};

export const serverProvider: Provider = {
  providerFactory: serverFactory,
  serializers,
  factoryOptions: null,
};
