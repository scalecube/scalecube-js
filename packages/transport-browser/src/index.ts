import { TransportApi } from '@scalecube/api';
import { ClientTransportOptions, RequestHandler } from '@scalecube/api/lib/transport';
import { Message } from '@scalecube/api/lib/microservice';
import { from, Observable } from 'rxjs';
import { createConnection } from './connection';
import { getAddress, getFullAddress } from '@scalecube/utils';

const obs = new Observable<any>((o) => {});

function createTransport() {
  const con = createConnection();

  return {
    clientTransport: {
      start: (options: ClientTransportOptions): Promise<RequestHandler> => {
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
        console.log('server stop not impl');
      };
    },
  } as TransportApi.Transport;
}

export const transport: TransportApi.Transport = createTransport();
