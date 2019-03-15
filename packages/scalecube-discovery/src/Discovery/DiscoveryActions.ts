import { Cluster, ClustersMap, ScalecubeGlobal } from '../api/public';
import { AddToCluster, GetCluster, NotifyAllListeners, RemoveFromCluster } from '../api/private/types';

export const getCluster = ({ seedAddress }: GetCluster): Cluster => {
  const globalNamespace: any = typeof window !== 'undefined' ? window : global;
  globalNamespace.scalecube = globalNamespace.scalecube || ({} as ScalecubeGlobal);
  globalNamespace.scalecube.discovery = globalNamespace.scalecube.discovery || ({} as ClustersMap);
  const namespace = globalNamespace.scalecube.discovery;
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

export const removeFromCluster = ({ cluster, address }: RemoveFromCluster): Cluster => {
  // remove from allEndPoints[]
  cluster.allEndPoints = cluster.allEndPoints.filter((endPoint) => endPoint.address !== address);
  // remove from each Node endPoints[]
  cluster.nodes.forEach((node) => {
    node.endPoints = node.endPoints.filter((endPoint) => endPoint.address !== address);
  });
  // remove node from the cluster
  cluster.nodes = cluster.nodes.filter((node) => node.address !== address);

  return cluster;
};

export const addToCluster = ({ cluster, endPoints, address, subjectNotifier }: AddToCluster): Cluster => {
  // add new endPoints[] to each node in the cluster
  cluster.nodes.forEach((node) => {
    node.endPoints = [...node.endPoints, ...endPoints];
  });

  const allPreviousEndPoints = [...(cluster.allEndPoints || [])];

  // add new node to the cluster (node doesn't contain its own endpoints)
  cluster.nodes.push({
    address,
    endPoints: allPreviousEndPoints,
    subjectNotifier,
  });
  // save current endPoints in the replaySubject cache.
  subjectNotifier && subjectNotifier.next(allPreviousEndPoints);
  // add new endPoints[] to the allEndPoints[]
  cluster.allEndPoints = [...(cluster.allEndPoints || []), ...endPoints];

  return cluster;
};
