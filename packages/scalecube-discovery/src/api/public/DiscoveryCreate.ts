import { Observable } from "rxjs";
import { Endpoint } from "@scalecube/scalecube-microservice/src/api/public";

export default interface DiscoveryCreate {
  end: () => Promise<string>;
  notifier: Observable<Endpoint[]>
}
