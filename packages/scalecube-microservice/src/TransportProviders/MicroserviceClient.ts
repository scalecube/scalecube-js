import { TransportApi, Address } from '@scalecube/api';
// @ts-ignore
import { RSocketClient, DuplexConnection } from 'rsocket-core';

export const createClient = ({
  address,
  transportClientProvider,
}: {
  address: Address;
  transportClientProvider: TransportApi.ClientProvider;
}) => {
  const { factoryOptions, clientFactory } = transportClientProvider;

  // TODO pick RSocketClient base on transport-browser type <PM || WS>
  return new RSocketClient({
    setup: {
      dataMimeType: 'text/plain',
      keepAlive: process.env.dev ? 1000 : 1000000,
      lifetime: process.env.dev ? 1000 : 1000000,
      metadataMimeType: 'text/plain',
    },
    transport: clientFactory({ address, factoryOptions }),
  });
};
