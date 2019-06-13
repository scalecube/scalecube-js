import { Address, TransportApi } from '@scalecube/api';
// @ts-ignore
import RSocketEventsServer from 'rsocket-events-server';

import { NOT_VALID_PROTOCOL } from '../helpers/constants';
import { validateAddress } from '../helpers/validation';

export const serverFactory: TransportApi.ProviderFactory = (options: { address: Address; factoryOptions?: any }) => {
  const { address, factoryOptions } = options;
  validateAddress(address);

  const { protocol, host, path, port, fullAddress } = address;
  switch (protocol.toLowerCase()) {
    case 'pm':
      return new RSocketEventsServer({ address: fullAddress });
    default:
      throw Error(NOT_VALID_PROTOCOL);
  }
};
