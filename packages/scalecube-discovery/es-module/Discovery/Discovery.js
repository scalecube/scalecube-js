import { ReplaySubject } from 'rxjs';
import { getCluster, joinCluster, leaveCluster } from './DiscoveryActions';
import { getDiscoverySuccessfullyDestroyedMessage } from '../helpers/const';
export var createDiscovery = function(_a) {
  var address = _a.address,
    itemsToPublish = _a.itemsToPublish,
    seedAddress = _a.seedAddress;
  var cluster = getCluster({ seedAddress: seedAddress });
  var subjectNotifier = new ReplaySubject(1);
  cluster = joinCluster({
    cluster: cluster,
    address: address,
    itemsToPublish: itemsToPublish,
    subjectNotifier: subjectNotifier,
  });
  return Object.freeze({
    destroy: function() {
      cluster = leaveCluster({ cluster: cluster, address: address });
      subjectNotifier && subjectNotifier.complete();
      return Promise.resolve(getDiscoverySuccessfullyDestroyedMessage(address, seedAddress));
    },
    discoveredItems$: function() {
      return subjectNotifier.asObservable();
    },
  });
};
