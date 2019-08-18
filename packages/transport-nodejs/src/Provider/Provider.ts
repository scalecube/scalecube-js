import { TransportApi } from '@scalecube/api';

// @ts-ignore
import { JsonSerializers } from 'rsocket-core';
import { clientFactory } from './ProviderClient';
import { serverFactory } from './ProviderServer';

const serializers = JsonSerializers;

export const TransportNodeJS: TransportApi.Transport = {
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
