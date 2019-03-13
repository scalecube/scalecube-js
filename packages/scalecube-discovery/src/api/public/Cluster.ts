import { Node } from './index';
import { Endpoint } from '@scalecube/scalecube-microservice/src/api/public';

export default interface Cluster {
  nodes: Node[];
  allEndPoints: Endpoint[];
}
