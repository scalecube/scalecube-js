import { Address } from '@scalecube/api';
import { getFullAddress, validateAddress, constants } from '@scalecube/utils';
// @ts-ignore
import RSocketEventsServer from 'rsocket-events-server';
import { ProviderFactory } from '@scalecube/rsocket-adapter';

export const serverFactory: ProviderFactory = (options: { address: Address; factoryOptions?: any }) => {
  const { address, factoryOptions } = options;
  validateAddress(address);

  const { protocol } = address;
  switch (protocol.toLowerCase()) {
    case 'pm':
      return new RSocketEventsServer({ address: getFullAddress(address) });
    default:
      throw Error(constants.NOT_VALID_PROTOCOL);
  }
};
