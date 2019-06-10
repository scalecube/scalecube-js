import { transportClientProviderCallback } from './TransportClient';
import { Transport as TransportInterface } from '../api';
import { transportServerProviderCallback } from './TransportServer';

export const Transport: TransportInterface = {
  remoteTransportClientProvider: {
    transportClientProviderCallback,
    remoteTransportClientProviderOptions: null,
  },
  remoteTransportServerProvider: {
    transportServerProviderCallback,
    remoteTransportServerProviderOptions: null,
  },
};
