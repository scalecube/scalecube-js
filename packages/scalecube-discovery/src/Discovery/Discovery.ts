import { Discovery as DiscoveryInterface, DiscoveryConnect, DiscoveryCreate } from "../api/public";
import { getSeed, notifyAllListeners, removeFromCluster, addToCluster } from "./DiscoveryActions";
import { Subject } from "rxjs";
import { Endpoint } from "@scalecube/scalecube-microservice/src/api/public";


export const Discovery: DiscoveryInterface = Object.freeze({
  create({ nodeData, seedAddress }: DiscoveryConnect): DiscoveryCreate {

    let seed = getSeed({ seedAddress });
    const subjectNotifier = new Subject<Endpoint[]>();

    seed = addToCluster({ seed, nodeData, subjectNotifier });
    notifyAllListeners({ seed });

    return Object.freeze({
      end: () => {
        seed = removeFromCluster({ seed, address: nodeData.address });
        notifyAllListeners({ seed });
        subjectNotifier && subjectNotifier.unsubscribe();
        return Promise.resolve('true')
      },

      subscriber: subjectNotifier
    })
  }
});

