import { setupServer, setupClient } from '@scalecube/rsocket-adapter';
import { clientProvider, serverProvider } from './Provider/Provider';

export const transport = {
  clientTransport: setupClient(clientProvider),
  serverTransport: setupServer(serverProvider),
};
