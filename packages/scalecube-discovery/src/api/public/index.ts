import Node from './Node';
import Discovery from './Discovery';
import DiscoveryCreate from './DiscoveryCreate';
import DiscoveryConnect from './DiscoveryConnect';
import Cluster from './Cluster';
import ClustersMap from './ClustersMap';

declare global {
  interface Window {
    scalecube?: {
      discovery?: ClustersMap
    };
  }
}

export { Node, Discovery, DiscoveryCreate, DiscoveryConnect, Cluster, ClustersMap };
