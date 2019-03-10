import { Endpoint } from "@scalecube/scalecube-microservice/src/api/public";
import { Subject } from "rxjs";

export default interface Node {
  address: string;
  endPoints: Endpoint[];
  subjectNotifier : Subject<Endpoint[]>;
}
