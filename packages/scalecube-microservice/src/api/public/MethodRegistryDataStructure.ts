import { Reference } from '.';

export default interface ServiceRegistryDataStructure {
  [qualifier: string]: Reference;
}
