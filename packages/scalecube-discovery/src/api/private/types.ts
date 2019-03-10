import { Node, Seed } from "../public";
import { Subject } from "rxjs";
import { Endpoint } from "@scalecube/scalecube-microservice/src/api/public";

export interface NotifyAllListeners {
  seed: Seed;
}

export interface GetSeed {
  seedAddress: string;
}

export interface AddToCluster {
  seed: Seed;
  nodeData: Node;
  subjectNotifier: Subject<Endpoint[]>;
}

export interface RemoveFromCluster {
  seed: Seed;
  address: string;
}
