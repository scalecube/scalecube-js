import Node from './Node';
import Discovery from './Discovery';
import DiscoveryCreate from './DiscoveryCreate';
import DiscoveryConnect from './DiscoveryConnect';
import Cluster from './Cluster';
import ClustersMap from './ClustersMap';
import ScalecubeGlobal from './ScalecubeGlobal';

declare global {
  interface Window {
    scalecube: ScalecubeGlobal;
  }
}

export { Node, Discovery, DiscoveryCreate, DiscoveryConnect, Cluster, ClustersMap, ScalecubeGlobal };
