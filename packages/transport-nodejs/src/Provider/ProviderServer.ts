import { TransportApi, Address } from '@scalecube/api';

// @ts-ignore
import RSocketWebSocketServer from 'rsocket-websocket-server';
// @ts-ignore
import RSocketTCPServer from 'rsocket-tcp-server';

import { NOT_VALID_PROTOCOL } from '../helpers/constants';
import { validateAddress } from '../helpers/validation';

export const serverFactory: TransportApi.ProviderFactory = (options: { address: Address; factoryOptions?: any }) => {
  const { address, factoryOptions } = options;

  validateAddress(address);

  const { protocol, host, path, port } = address;
  switch (protocol.toLowerCase()) {
    case 'ws':
      return new RSocketWebSocketServer({ ...address });
    case 'tcp':
      return new RSocketTCPServer({ ...address });
    default:
      throw Error(NOT_VALID_PROTOCOL);
  }
};
