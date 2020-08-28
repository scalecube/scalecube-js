import { TransportApi } from '@scalecube/api';
import { ClientTransportOptions, Invoker } from '@scalecube/api/lib/transport';
import { createClient, createServer } from './connection';
import { getFullAddress } from '@scalecube/utils';

function createTransport() {
  const client = createClient();

  return {
    clientTransport: {
      start: (options: ClientTransportOptions): Promise<Invoker> => {
        return Promise.resolve({
          requestResponse: (message) => client.requestResponse(getFullAddress(options.remoteAddress), message),
          requestStream: (message) => client.requestStream(getFullAddress(options.remoteAddress), message),
        });
      },
      destroy: (options) => {
        client.shutdown(options.address);
      },
    },
    serverTransport: (options) => {
      return createServer(getFullAddress(options.localAddress), options.serviceCall);
    },
  } as TransportApi.Transport;
}

export const transport: TransportApi.Transport = createTransport();
