import { Api as TransportAPI } from '@scalecube/transport';

export const getDiscoverySuccessfullyDestroyedMessage = (
  nodeAddress: TransportAPI.Address,
  seedAddress: TransportAPI.Address
) => `${nodeAddress.fullAddress} has been removed from ${seedAddress.fullAddress}`;
