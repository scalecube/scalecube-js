import { Endpoint } from '@scalecube/scalecube-microservice/src/api/public';
import { ReplaySubject } from 'rxjs';

export default interface Node {
  address: string;
  endPoints: Endpoint[];
  subjectNotifier: ReplaySubject<Endpoint[]>;
}
