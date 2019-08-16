import { Address } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';

export const INVALID_ITEMS_TO_PUBLISH = 'itemsToPublish are not of type Array';
export const NODEJS_MUST_PROVIDE_CLUSTER_IMPL = 'Must provide cluster when running on nodejs';

export const getAddressCollision = (address: string, seedAddress: string) =>
  `address ${address} must be different from a seed Address ${seedAddress}`;

export const getDiscoverySuccessfullyDestroyedMessage = (address: Address) =>
  `${getFullAddress(address)} has been removed`;
