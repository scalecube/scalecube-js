import { ReplaySubject } from 'rxjs';
import { Item } from '../api';
import { Address } from '@scalecube/api';

declare global {
  interface Window {
    scalecube: ScalecubeGlobal;
  }
}

declare global {
  namespace NodeJS {
    interface Global {
      scalecube: ScalecubeGlobal;
    }
  }
}

export interface ScalecubeGlobal {
  clusters: ClustersMap;
}

export interface ClustersMap {
  [seedAddress: string]: Cluster;
}

export interface ShareDataBetweenDiscoveries {
  discoveries: DiscoveryEntity[];
}

export interface DiscoveryEntity {
  address: Address;
  discoveredItems: Item[];
  subjectNotifier: ReplaySubject<Item[]>;
}

export interface GetCluster {
  seedAddress: Address;
}

export interface JoinCluster {
  cluster: Cluster;
  address: Address;
  itemsToPublish: Item[];
  subjectNotifier: ReplaySubject<Item[]>;
}

export interface LeaveCluster {
  cluster: Cluster;
  address: Address;
}

export interface Cluster {
  discoveries: DiscoveryEntity[];
  allDiscoveredItems: Item[];
}
