import { TransportApi, Address } from '@scalecube/api';
// @ts-ignore
import RSocketEventsClient from 'rsocket-events-client';

import { NOT_VALID_PROTOCOL } from '../helpers/constants';
import { validateAddress } from '../helpers/validation';

export const clientFactory: TransportApi.ProviderFactory = (options: { address: Address; factoryOptions?: any }) => {
  const { address, factoryOptions } = options;

  validateAddress(address);

  const { protocol, host, path, port, fullAddress } = address;
  switch (protocol.toLowerCase()) {
    case 'pm':
      return new RSocketEventsClient({ address: fullAddress });
    default:
      throw Error(NOT_VALID_PROTOCOL);
  }
};
