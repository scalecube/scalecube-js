import { TransportApi } from '@scalecube/api';
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

export const TransportBrowser: TransportApi.Transport = {
  clientProvider: {
    providerFactory: clientFactory,
    serializers,
    factoryOptions: null,
  },
  serverProvider: {
    providerFactory: serverFactory,
    serializers,
    factoryOptions: null,
  },
};
