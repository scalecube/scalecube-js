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
  const { factoryOptions, clientFactory, serializers } = transportClientProvider;

  // TODO pick RSocketClient base on transport-browser type <PM || WS>
  return new RSocketClient({
    serializers,
    setup: {
      dataMimeType: 'text/plain',
      keepAlive: 1000000,
      lifetime: 1000000,
      metadataMimeType: 'text/plain',
    },
    transport: clientFactory({ address, factoryOptions }),
  });
};
