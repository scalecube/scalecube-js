import { TransportApi, Address } from '@scalecube/api';
import { getFullAddress, validateAddress, constants } from '@scalecube/utils';
// @ts-ignore
import RSocketEventsClient from 'rsocket-events-client';

export const clientFactory: TransportApi.ProviderFactory = (options: { address: Address; factoryOptions?: any }) => {
  const { address, factoryOptions } = options;

  validateAddress(address);

  const { protocol } = address;

  switch (protocol.toLowerCase()) {
    case 'pm':
      return new RSocketEventsClient({ address: getFullAddress(address) });
    default:
      throw Error(constants.NOT_VALID_PROTOCOL);
  }
};
