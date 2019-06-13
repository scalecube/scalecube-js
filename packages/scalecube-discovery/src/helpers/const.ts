import { Address } from '@scalecube/api';

export const getAddressCollusion = (addressPort: Address, seedAddressPort: Address) =>
  `address ${addressPort.fullAddress} must be different from the seed Address ${seedAddressPort.fullAddress}`;

export const getDiscoverySuccessfullyDestroyedMessage = (nodeAddress: Address, seedAddress: Address) =>
  `${nodeAddress.fullAddress} has been removed from ${seedAddress.fullAddress}`;
