import { Cluster } from '../api/public'
import { AddToCluster, GetCluster, NotifyAllListeners, RemoveFromCluster } from '../api/private/types';

export const getCluster = ({ seedAddress }: GetCluster): Cluster => {
  window.scalecube = window.scalecube || {};
  const namespace = (window.scalecube.discovery = window.scalecube.discovery || {});

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

  const immutEndPoints = [...(cluster.allEndPoints || [])];

  // add new node to the cluster
  cluster.nodes.push({
    address,
    endPoints: immutEndPoints,
    subjectNotifier,
  });
  // save current endPoints in the replaySubject cache.
  subjectNotifier && subjectNotifier.next(immutEndPoints);
  // add new endPoints[] to the allEndPoints[]
  cluster.allEndPoints = cluster.allEndPoints ? [...cluster.allEndPoints, ...endPoints] : [...endPoints];

  return cluster;
};
