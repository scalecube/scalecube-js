import { getGlobalNamespace, getScalecubeGlobal } from '../helpers/utils';
export var getCluster = function(_a) {
  var seedAddress = _a.seedAddress;
  var globalNamespace = getGlobalNamespace();
  globalNamespace.scalecube = globalNamespace.scalecube || {};
  globalNamespace.scalecube.clusters = globalNamespace.scalecube.clusters || {};
  var namespace = getScalecubeGlobal().clusters;
  if (!namespace[seedAddress]) {
    namespace[seedAddress] = {
      discoveries: [],
      allDiscoveredItems: [],
    };
  }
  return namespace[seedAddress];
};
export var leaveCluster = function(_a) {
  var cluster = _a.cluster,
    address = _a.address;
  // remove from allDiscoveredItems[]
  cluster.allDiscoveredItems = cluster.allDiscoveredItems.filter(function(item) {
    return item.address !== address;
  });
  // remove from each discoveryEntity discoveredItems[]
  cluster.discoveries.forEach(function(discovery) {
    discovery.discoveredItems = discovery.discoveredItems.filter(function(item) {
      return item.address !== address;
    });
  });
  // remove discoveryEntity from the cluster
  cluster.discoveries = cluster.discoveries.filter(function(discovery) {
    return discovery.address !== address;
  });
  shareDataBetweenDiscoveries({ discoveries: cluster.discoveries });
  return cluster;
};
export var joinCluster = function(_a) {
  var cluster = _a.cluster,
    itemsToPublish = _a.itemsToPublish,
    address = _a.address,
    subjectNotifier = _a.subjectNotifier;
  // add new discoveredItems[] to each discoveryEntity in the cluster
  cluster.discoveries.forEach(function(discovery) {
    discovery.discoveredItems = discovery.discoveredItems.concat(itemsToPublish);
  });
  var allPreviousDiscoveredItems = (cluster.allDiscoveredItems || []).slice();
  // add new discoveryEntity to the cluster (discoveryEntity doesn't contain its own discoveredItems[])
  cluster.discoveries.push({
    address: address,
    discoveredItems: allPreviousDiscoveredItems,
    subjectNotifier: subjectNotifier,
  });
  // add new discoveredItems[] to the allDiscoveredItems[]
  cluster.allDiscoveredItems = (cluster.allDiscoveredItems || []).concat(itemsToPublish);
  shareDataBetweenDiscoveries({ discoveries: cluster.discoveries });
  return cluster;
};
var shareDataBetweenDiscoveries = function(_a) {
  var discoveries = _a.discoveries;
  return discoveries.forEach(function(discovery) {
    return discovery && discovery.subjectNotifier && discovery.subjectNotifier.next(discovery.discoveredItems || []);
  });
};
