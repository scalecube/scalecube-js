import { Address } from '@scalecube/api';
import { validateAddress, constants } from '@scalecube/utils';
// @ts-ignore
import RSocketWebSocketServer from 'rsocket-websocket-server';
// @ts-ignore
import RSocketTCPServer from 'rsocket-tcp-server';
import { ProviderFactory } from '@scalecube/rsocket-adapter';

export const serverFactory: ProviderFactory = (options: { address: Address; factoryOptions?: any }) => {
  const { address, factoryOptions } = options;

  validateAddress(address);

  const { protocol, host, path, port } = address;
  switch (protocol.toLowerCase()) {
    case 'ws':
    case 'wss':
      return new RSocketWebSocketServer({ ...address });
    case 'tcp':
      return new RSocketTCPServer({ ...address });
    default:
      throw Error(constants.NOT_VALID_PROTOCOL);
  }
};
