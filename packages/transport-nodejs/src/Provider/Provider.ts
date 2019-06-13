import { TransportApi } from '@scalecube/api';

import { clientFactory } from './ProviderClient';
import { serverFactory } from './ProviderServer';

export const TransportNodeJS: TransportApi.Transport = {
  clientProvider: {
    clientFactory,
    factoryOptions: null,
  },
  serverProvider: {
    serverFactory,
    factoryOptions: null,
  },
};
