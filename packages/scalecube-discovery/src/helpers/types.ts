import { ReplaySubject } from 'rxjs';
import { Item } from '../api';
import { Api as TransportAPI } from '@scalecube/transport';

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
  address: TransportAPI.Address;
  discoveredItems: Item[];
  subjectNotifier: ReplaySubject<Item[]>;
}

export interface GetCluster {
  seedAddress: TransportAPI.Address;
}

export interface JoinCluster {
  cluster: Cluster;
  address: TransportAPI.Address;
  itemsToPublish: Item[];
  subjectNotifier: ReplaySubject<Item[]>;
}

export interface LeaveCluster {
  cluster: Cluster;
  address: TransportAPI.Address;
}

export interface Cluster {
  discoveries: DiscoveryEntity[];
  allDiscoveredItems: Item[];
}
