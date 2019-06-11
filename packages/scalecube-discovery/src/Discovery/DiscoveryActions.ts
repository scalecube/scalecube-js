import {
  JoinCluster,
  Cluster,
  ClustersMap,
  GetCluster,
  ShareDataBetweenDiscoveries,
  LeaveCluster,
  ScalecubeGlobal,
} from '../helpers/types';
import { getGlobalNamespace, getScalecubeGlobal } from '../helpers/utils';

export const getCluster = ({ seedAddress }: GetCluster): Cluster => {
  const { fullAddress: seedAddressName } = seedAddress;
  const globalNamespace = getGlobalNamespace();
  globalNamespace.scalecube = globalNamespace.scalecube || ({} as ScalecubeGlobal);
  globalNamespace.scalecube.clusters = globalNamespace.scalecube.clusters || ({} as ClustersMap);
  const namespace = getScalecubeGlobal().clusters;
  if (!namespace[seedAddressName]) {
    namespace[seedAddressName] = {
      discoveries: [],
      allDiscoveredItems: [],
    };
  }

  return namespace[seedAddressName];
};

export const leaveCluster = ({ cluster, address }: LeaveCluster): Cluster => {
  // remove from allDiscoveredItems[]
  cluster.allDiscoveredItems = cluster.allDiscoveredItems.filter(
    (item) => item.address.fullAddress !== address.fullAddress
  );
  // remove from each discoveryEntity discoveredItems[]
  cluster.discoveries.forEach((discovery) => {
    discovery.discoveredItems = discovery.discoveredItems.filter(
      (item) => item.address.fullAddress !== address.fullAddress
    );
  });
  // remove discoveryEntity from the cluster
  cluster.discoveries = cluster.discoveries.filter(
    (discovery) => discovery.address.fullAddress !== address.fullAddress
  );

  shareDataBetweenDiscoveries({ discoveries: cluster.discoveries });

  return cluster;
};

export const joinCluster = ({ cluster, itemsToPublish, address, subjectNotifier }: JoinCluster): Cluster => {
  // add new discoveredItems[] to each discoveryEntity in the cluster
  cluster.discoveries.forEach((discovery) => {
    discovery.discoveredItems = [...discovery.discoveredItems, ...itemsToPublish];
  });

  const allPreviousDiscoveredItems = [...(cluster.allDiscoveredItems || [])];

  // add new discoveryEntity to the cluster (discoveryEntity doesn't contain its own discoveredItems[])
  cluster.discoveries.push({
    address,
    discoveredItems: allPreviousDiscoveredItems,
    subjectNotifier,
  });
  // add new discoveredItems[] to the allDiscoveredItems[]
  cluster.allDiscoveredItems = [...(cluster.allDiscoveredItems || []), ...itemsToPublish];

  shareDataBetweenDiscoveries({ discoveries: cluster.discoveries });

  return cluster;
};

const shareDataBetweenDiscoveries = ({ discoveries }: ShareDataBetweenDiscoveries) =>
  discoveries.forEach(
    (discovery) =>
      discovery && discovery.subjectNotifier && discovery.subjectNotifier.next(discovery.discoveredItems || [])
  );
