import { Seed } from "../api/public";
import { AddToCluster, GetSeed, NotifyAllListeners, RemoveFromCluster } from "../api/private/types";

export const getSeed = ({ seedAddress }: GetSeed): Seed => {
  // @ts-ignore
  window.scalecube = window.scalecube || {};
  // @ts-ignore
  const namespace = window.scalecube.discovery = window.scalecube.discovery || {};

  if (!namespace[seedAddress]) {
    namespace[seedAddress] = {
      cluster: [],
      allEndPoints: []
    }
  }

  return namespace[seedAddress];
};


export const notifyAllListeners = ({ seed }: NotifyAllListeners) =>
  seed.cluster.forEach(node =>
    node && node.subjectNotifier && node.subjectNotifier.next(node.endPoints || [])
  );

export const removeFromCluster = ({ seed, address }: RemoveFromCluster) : Seed => {
  // remove from allEndPoints[]
  seed.allEndPoints = seed.allEndPoints.filter(endPoint => endPoint.address !== address);
  // remove from each Node endPoints[]
  seed.cluster.forEach(node => {
    node.endPoints = node.endPoints.filter(endPoint => endPoint.address !== address);
  });
  // remove node from the cluster
  seed.cluster = {
    ...seed.cluster,
    [address]: null
  };

  return seed;
};

export const addToCluster = ({ seed, endPoints, address, subjectNotifier }: AddToCluster) : Seed => {
  // add new endPoints[] to each node in the cluster
  seed.cluster.forEach(node => {
    node.endPoints = [...node.endPoints, ...endPoints]
  });
  // add new node to the cluster
  seed.cluster.push({
    address: address,
    endPoints: seed.allEndPoints || [],
    subjectNotifier
  });
  // add new endPoints[] to the allEndPoints[]
  seed.allEndPoints = seed.allEndPoints ? [...seed.allEndPoints, ...endPoints] : [...endPoints];

  return seed;
};
