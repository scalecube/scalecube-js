import { validateAddress, constants } from '@scalecube/utils';
import { Address, TransportApi } from '@scalecube/api';
// @ts-ignore
import RSocketWebSocketClient from 'rsocket-websocket-client';
// @ts-ignore
import RSocketTcpClient from 'rsocket-tcp-client';
// @ts-ignore
import WebSocket from 'ws';

export const clientFactory: TransportApi.ProviderFactory = (options: { address: Address; factoryOptions?: any }) => {
  const { address, factoryOptions } = options;

  validateAddress(address);

  const { protocol } = address;
  switch (protocol.toLowerCase()) {
    case 'ws':
      return new RSocketWebSocketClient({
        url: 'ws://' + address.host + ':' + address.port,
        wsCreator: (url: string) => {
          return new WebSocket(url);
        },
      });
    case 'wss':
      return new RSocketWebSocketClient({
        url: 'wss://' + address.host + ':' + address.port,
        wsCreator: (url: string) => {
          return new WebSocket(url);
        },
      });
    case 'tcp':
      return new RSocketTcpClient({ ...address });
    default:
      throw Error(constants.NOT_VALID_PROTOCOL);
  }
};
