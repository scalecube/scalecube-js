import { TransportApi } from '@scalecube/api';
import { ClientTransportOptions, Invoker } from '@scalecube/api/lib/transport';
import { createConnection } from './connection';
import { getFullAddress } from '@scalecube/utils';

function createTransport() {
  const con = createConnection();

  return {
    clientTransport: {
      start: (options: ClientTransportOptions): Promise<Invoker> => {
        return Promise.resolve({
          requestResponse: (message) => con.requestResponse(getFullAddress(options.remoteAddress), message),
          requestStream: (message) => con.requestStream(getFullAddress(options.remoteAddress), message),
        });
      },
      destroy: () => {},
    },
    serverTransport: (options) => {
      con.server(getFullAddress(options.localAddress), options.serviceCall);

      return () => {
        // console.log('server stop not impl');
      };
    },
  } as TransportApi.Transport;
}

export const transport: TransportApi.Transport = createTransport();
