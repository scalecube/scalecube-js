import { Address } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';

export const ADDRESS_DESTROYED = 'address already been removed';
export const INVALID_ITEMS_TO_PUBLISH = 'itemsToPublish are not of type Array';

export const getAddressCollision = (address: string, seedAddress: string) =>
  `address ${address} must be different from the seed Address ${seedAddress}`;

export const getDiscoverySuccessfullyDestroyedMessage = (address: Address) =>
  `${getFullAddress(address)} has been removed`;
