import {RemoteCluster} from "../Cluster/RemoteCluster";

export const createId = () => String(Date.now()) + String(Math.random()) + String(Math.random()) + String(Math.random());

export const createRemoteCluster = (clusterId) => {
  const remoteCluster = new RemoteCluster();
  remoteCluster.transport({
    type: 'PostMessage',
    worker: main,
    me: mainEventEmitter,
    clusterId
  });
  return remoteCluster;
};

export const createRemoteClustersById = clusterIds => clusterIds.map(({ id }) => createRemoteCluster(id));

export const formatSuccessResponse = responses => 'success';