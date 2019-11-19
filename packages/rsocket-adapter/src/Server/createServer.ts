import { Address, TransportApi } from '@scalecube/api';
// @ts-ignore
import RSocketServer from 'rsocket-core/build/RSocketServer';
import { getSerializers } from '../helpers/defaultConfiguration';
import { RsocketEventsPayload } from '../helpers/types';
import { Provider } from '../api/Provider';

export const createServer = ({
  address,
  serverProvider,
  serviceCall,
}: {
  address: Address;
  serverProvider: Provider;
  serviceCall: TransportApi.RequestHandler;
}) => {
  const { factoryOptions, providerFactory } = serverProvider;

  const serializers = serverProvider.serializers || getSerializers();

  const server = new RSocketServer({
    getRequestHandler: (socket: any) => {
      return {
        requestResponse: ({ data = {}, metadata = {} }: RsocketEventsPayload) => serviceCall.requestResponse(data),
        requestStream: ({ data = {}, metadata = {} }: RsocketEventsPayload) => serviceCall.requestStream(data),
      };
    },
    serializers,
    transport: providerFactory({ address, factoryOptions }),
  });

  server.start();

  return () => {
    try {
      server.stop.bind(server);
    } catch (e) {
      console.error('RSocket unable to close connection ' + e);
    }
  };
};
