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
  const globalNamespace = getGlobalNamespace();
  globalNamespace.scalecube = globalNamespace.scalecube || ({} as ScalecubeGlobal);
  globalNamespace.scalecube.clusters = globalNamespace.scalecube.clusters || ({} as ClustersMap);

  const clusterWorker = new SharedWorker('/clustersWorker.js');
  clusterWorker.port.start();
  clusterWorker.port.postMessage(seedAddress);

  const namespace = getScalecubeGlobal().clusters;
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
  discoveries.forEach(
    (discovery) =>
      discovery && discovery.subjectNotifier && discovery.subjectNotifier.next(discovery.discoveredItems || [])
  );
