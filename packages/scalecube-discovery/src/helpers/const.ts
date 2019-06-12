import { Address } from '@scalecube/api';

export const getDiscoverySuccessfullyDestroyedMessage = (nodeAddress: Address, seedAddress: Address) =>
  `${nodeAddress.fullAddress} has been removed from ${seedAddress.fullAddress}`;
