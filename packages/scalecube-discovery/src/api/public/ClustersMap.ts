import Cluster from './Cluster'

export default interface ClustersMap {
  [seedAddress: string]: Cluster
}
