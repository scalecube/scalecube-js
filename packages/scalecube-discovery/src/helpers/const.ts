import { Address } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';

export const getAddressCollision = (addressPort: Address, seedAddressPort: Address) =>
  `address ${getFullAddress(addressPort)} must be different from the seed Address ${getFullAddress(seedAddressPort)}`;

export const getDiscoverySuccessfullyDestroyedMessage = (nodeAddress: Address, seedAddress: Address) =>
  `${getFullAddress(nodeAddress)} has been removed from ${getFullAddress(seedAddress)}`;
