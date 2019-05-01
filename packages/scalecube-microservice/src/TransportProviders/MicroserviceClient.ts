// @ts-ignore
import RSocketEventsClient from 'rsocket-events-client';
// @ts-ignore
import { RSocketClient } from 'rsocket-core';

export const CreateClient = (clientOptions: { address: string }) =>
  // TODO pick RSocketClient base on transport type <PM || WS>
  new RSocketClient({
    setup: {
      dataMimeType: 'text/plain',
      keepAlive: process.env.dev ? 1000 : 1000000,
      lifetime: process.env.dev ? 1000 : 1000000,
      metadataMimeType: 'text/plain',
    },
    transport: new RSocketEventsClient(clientOptions),
  });
