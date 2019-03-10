import { Subject } from "rxjs";
import { Endpoint } from "@scalecube/scalecube-microservice/src/api/public";

export default interface DiscoveryCreate {
  end: () => Promise<string>;
  subscriber: Subject<Endpoint[]>;
}
