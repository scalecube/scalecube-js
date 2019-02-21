import { Endpoint } from '.';

export default interface ServiceRegistryDataStructure {
  [qualifier: string]: Endpoint[];
}
