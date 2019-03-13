import { ReplaySubject } from 'rxjs';
import { Endpoint } from '@scalecube/scalecube-microservice/src/api/public';
import { Discovery as DiscoveryInterface, DiscoveryConnect, DiscoveryCreate } from '../api/public';
import { getCluster, notifyAllListeners, removeFromCluster, addToCluster } from './DiscoveryActions';

export const Discovery: DiscoveryInterface = Object.freeze({
  create({ address, endPoints, seedAddress }: DiscoveryConnect): DiscoveryCreate {
    let cluster = getCluster({ seedAddress });
    const subjectNotifier = new ReplaySubject<Endpoint[]>(1);

    cluster = addToCluster({ cluster, address, endPoints, subjectNotifier });
    notifyAllListeners({ cluster });

    return Object.freeze({
      end: () => {
        cluster = removeFromCluster({ cluster, address });
        notifyAllListeners({ cluster });
        subjectNotifier && subjectNotifier.complete();
        return Promise.resolve(`${address} as been removed from ${seedAddress}`);
      },
      notifier: subjectNotifier.asObservable(),
    });
  },
});
