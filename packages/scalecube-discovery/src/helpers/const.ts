import { Address } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';

export const ADDRESS_DESTROYED = 'address already been removed';

export const getAddressCollision = (address: Address, seedAddress: Address) =>
  `address ${getFullAddress(address)} must be different from the seed Address ${getFullAddress(seedAddress)}`;

export const getDiscoverySuccessfullyDestroyedMessage = (address: Address) =>
  `${getFullAddress(address)} has been removed`;
