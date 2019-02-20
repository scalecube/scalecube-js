import { Endpoint } from '.';

export default interface ServiceRegistry {
  [qualifier: string]: Endpoint[];
}
