import { Address } from '../api';
// @ts-ignore
import RSocketEventsClient from 'rsocket-events-client';
// @ts-ignore
import RSocketWebSocketClient from 'rsocket-websocket-client';
// @ts-ignore
import RSocketTcpClient from 'rsocket-tcp-client';
// @ts-ignore
import WebSocket from 'ws';

import { NOT_VALID_PROTOCOL } from '../helpers/constants';
import { validateAddress } from '../helpers/validation';

export const transportClientProviderCallback = ({
  address,
  remoteTransportClientProviderOptions,
}: {
  address: Address;
  remoteTransportClientProviderOptions: any;
}) => {
  validateAddress(address);

  const { protocol, host, path, port } = address;
  switch (protocol.toLowerCase()) {
    case 'pm':
      return new RSocketEventsClient({ address: `${protocol}://${host}:${port}/${path}` });
    case 'ws':
      return new RSocketWebSocketClient({
        url: 'ws://' + address.host + ':' + address.port,
        wsCreator: (url: string) => {
          return new WebSocket(url);
        },
      });
    case 'tcp':
      return new RSocketTcpClient({ ...address });
    default:
      throw Error(NOT_VALID_PROTOCOL);
  }
};
