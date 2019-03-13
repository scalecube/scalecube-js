import { Cluster } from '../public';
import { ReplaySubject } from 'rxjs';
import { Endpoint } from '@scalecube/scalecube-microservice/src/api/public';

export interface NotifyAllListeners {
  cluster: Cluster;
}

export interface GetCluster {
  seedAddress: string;
}

export interface AddToCluster {
  cluster: Cluster;
  address: string;
  endPoints: Endpoint[];
  subjectNotifier: ReplaySubject<Endpoint[]>;
}

export interface RemoveFromCluster {
  cluster: Cluster;
  address: string;
}
