import { ReplaySubject } from 'rxjs';

declare global {
  interface Window {
    scalecube: ScalecubeGlobal;
  }
}

declare global {
  interface Global {
    scalecube: ScalecubeGlobal;
  }
}

export type Item = any;

export interface NotifyAllListeners {
  cluster: Cluster;
}

export interface GetCluster {
  seedAddress: string;
}

export interface AddToCluster {
  cluster: Cluster;
  nodeAddress: string;
  endPoints: Item[];
  subjectNotifier: ReplaySubject<Item[]>;
}

export interface RemoveFromCluster {
  cluster: Cluster;
  nodeAddress: string;
}

export interface Cluster {
  nodes: Node[];
  allEndPoints: Item[];
}

export interface ClustersMap {
  [seedAddress: string]: Cluster;
}

export interface Node {
  address: string;
  endPoints: Item[];
  subjectNotifier: ReplaySubject<Item[]>;
}

export interface ScalecubeGlobal {
  clusters: ClustersMap;
}
