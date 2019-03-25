import { ReplaySubject } from 'rxjs';

declare global {
  interface Window {
    scalecube: ScalecubeGlobal;
  }
}

export interface ScalecubeGlobal {
  clusters: ClustersMap;
}

export interface ClustersMap {
  [seedAddress: string]: Cluster;
}

export interface Item {
  address: string
}

export interface ShareDataBetweenDiscoveries {
  discoveries: DiscoveryEntity[]
}

export interface DiscoveryEntity {
  address: string;
  discoveredItems: Item[];
  subjectNotifier: ReplaySubject<Item[]>;
}

export interface GetCluster {
  seedAddress: string;
}

export interface JoinCluster {
  cluster: Cluster;
  address: string;
  itemsToPublish: Item[];
  subjectNotifier: ReplaySubject<Item[]>;
}

export interface LeaveCluster {
  cluster: Cluster;
  address: string;
}

export interface Cluster {
  discoveries: DiscoveryEntity[];
  allDiscoveredItems: Item[];
}





