import { Provider } from '@scalecube/rsocket-adapter';

// @ts-ignore
import { JsonSerializers } from 'rsocket-core';
import { clientFactory } from './ProviderClient';
import { serverFactory } from './ProviderServer';

const serializers = JsonSerializers;

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
