// @ts-ignore
import RSocketEventsClient from 'rsocket-events-client';
// @ts-ignore
import { RSocketClient } from 'rsocket-core';

export const CreateClient = (clientOptions: { address: string }) =>
  new RSocketClient({
    setup: {
      dataMimeType: 'text/plain',
      keepAlive: 1000000,
      lifetime: 100000,
      metadataMimeType: 'text/plain',
    },
    transport: new RSocketEventsClient(clientOptions),
  });
