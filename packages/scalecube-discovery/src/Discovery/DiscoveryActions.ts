import {
  AddToCluster,
  Cluster,
  ClustersMap,
  GetCluster,
  NotifyAllListeners,
  RemoveFromCluster,
  ScalecubeGlobal,
} from '../helpers/types';
import { getGlobal } from '../helpers/utils'

export const getCluster = ({ seedAddress }: GetCluster): Cluster => {
  const globalNamespace = getGlobal()
  globalNamespace.scalecube = globalNamespace.scalecube || ({} as ScalecubeGlobal);
  globalNamespace.scalecube.clusters = globalNamespace.scalecube.clusters || ({} as ClustersMap);
  const namespace = window.scalecube.clusters;
  if (!namespace[seedAddress]) {
    namespace[seedAddress] = {
      nodes: [],
      allEndPoints: [],
    };
  }

  return namespace[seedAddress];
};

export const notifyAllListeners = ({ cluster }: NotifyAllListeners) =>
  cluster.nodes.forEach((node) => node && node.subjectNotifier && node.subjectNotifier.next(node.endPoints || []));

export const removeFromCluster = ({ cluster, nodeAddress }: RemoveFromCluster): Cluster => {
  // remove from allEndPoints[]
  cluster.allEndPoints = cluster.allEndPoints.filter((endPoint) => endPoint.address !== nodeAddress);
  // remove from each Node endPoints[]
  cluster.nodes.forEach((node) => {
    node.endPoints = node.endPoints.filter((endPoint) => endPoint.address !== nodeAddress);
  });
  // remove node from the cluster
  cluster.nodes = cluster.nodes.filter((node) => node.address !== nodeAddress);

  return cluster;
};

export const addToCluster = ({ cluster, endPoints, nodeAddress, subjectNotifier }: AddToCluster): Cluster => {
  // add new endPoints[] to each node in the cluster
  cluster.nodes.forEach((node) => {
    node.endPoints = [...node.endPoints, ...endPoints];
  });

  const allPreviousEndPoints = [...(cluster.allEndPoints || [])];

  // add new node to the cluster (node doesn't contain its own endpoints)
  cluster.nodes.push({
    address: nodeAddress,
    endPoints: allPreviousEndPoints,
    subjectNotifier,
  });
  // save current endPoints in the replaySubject cache.
  subjectNotifier && subjectNotifier.next(allPreviousEndPoints);
  // add new endPoints[] to the allEndPoints[]
  cluster.allEndPoints = [...(cluster.allEndPoints || []), ...endPoints];

  return cluster;
};
