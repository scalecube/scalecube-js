import { ReplaySubject } from 'rxjs';
import { Endpoint } from '@scalecube/scalecube-microservice/src/api/public';

export default interface DiscoveryCreate {
  end: () => Promise<string>;
  subscriber: ReplaySubject<Endpoint[]>;
}
