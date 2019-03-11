import { Discovery as DiscoveryInterface, DiscoveryConnect, DiscoveryCreate } from "../api/public";
import { getSeed, notifyAllListeners, removeFromCluster, addToCluster } from "./DiscoveryActions";
import { ReplaySubject } from "rxjs";
import { Endpoint } from "@scalecube/scalecube-microservice/src/api/public";


export const Discovery: DiscoveryInterface = Object.freeze({
  create({ address, endPoints, seedAddress }: DiscoveryConnect): DiscoveryCreate {

    let seed = getSeed({ seedAddress });
    const subjectNotifier = new ReplaySubject<Endpoint[]>(1);

    seed = addToCluster({ seed, address, endPoints, subjectNotifier });
    notifyAllListeners({ seed });

    return Object.freeze({
      end: () => {
        seed = removeFromCluster({ seed, address });
        notifyAllListeners({ seed });
        subjectNotifier && subjectNotifier.unsubscribe();
        return Promise.resolve('true')
      },

      subscriber: subjectNotifier
    })
  }
});

