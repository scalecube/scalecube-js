// @ts-ignore
import RSocketEventsServer from 'rsocket-events-server';
// @ts-ignore
import RSocketWebSocketServer from 'rsocket-websocket-server';
// @ts-ignore
import RSocketTCPServer from 'rsocket-tcp-server';
// @ts-ignore
import { TransportServer } from 'rsocket-core';
import { Address } from '../api';
import { NOT_VALID_PROTOCOL } from '../helpers/constants';

export const transportServerProviderCallback = ({
  address,
  remoteTransportServerProviderOptions,
}: {
  address: Address;
  remoteTransportServerProviderOptions: any;
}): TransportServer => {
  const { protocol, host, path, port } = address;
  switch (protocol.toLowerCase()) {
    case 'pm':
      return new RSocketEventsServer({ address: `${protocol}://${host}:${port}/${path}` });
    case 'ws':
      return new RSocketWebSocketServer({ ...address });
    case 'tcp':
      return new RSocketTCPServer({ ...address });
    default:
      throw Error(NOT_VALID_PROTOCOL);
  }
};
