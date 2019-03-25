import {
  JoinCluster,
  Cluster,
  ClustersMap,
  GetCluster,
  ShareDataBetweenDiscoveries,
  LeaveCluster,
  ScalecubeGlobal,
} from '../helpers/types';

export const getCluster = ({ seedAddress }: GetCluster): Cluster => {
  window.scalecube = window.scalecube || ({} as ScalecubeGlobal);
  window.scalecube.clusters = window.scalecube.clusters || ({} as ClustersMap);
  const namespace = window.scalecube.clusters;
  if (!namespace[seedAddress]) {
    namespace[seedAddress] = {
      discoveries: [],
      allDiscoveredItems: [],
    };
  }

  return namespace[seedAddress];
};

export const leaveCluster = ({ cluster, address }: LeaveCluster): Cluster => {
  // remove from allDiscoveredItems[]
  cluster.allDiscoveredItems = cluster.allDiscoveredItems.filter((item) => item.address !== address);
  // remove from each discoveryEntity discoveredItems[]
  cluster.discoveries.forEach((discovery) => {
    discovery.discoveredItems = discovery.discoveredItems.filter((item) => item.address !== address);
  });
  // remove discoveryEntity from the cluster
  cluster.discoveries = cluster.discoveries.filter((discovery) => discovery.address !== address);

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
  discoveries.forEach((discovery) => discovery && discovery.subjectNotifier && discovery.subjectNotifier.next(discovery.discoveredItems || []));
