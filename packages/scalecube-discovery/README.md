[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> **NOTICE** versions 0.0.x are experimental without LTS or the API and behavior might change from patch to patch

# Discovery

Discovery provides access to a Cluster, ability to add new Node with some entrypoints, subscribe to the changes of
entrypoints within the Cluster.

## Basic Usage

```javascript
const discoveryConfig = {
  seedAddress : 'cluster1', // string
  address : 'random-node-identifier', // string
  endPoints: [] // Item[]
}

const discovery = createDiscovery(discoveryConfig);
discovery.notifier.subscribe(console.log); // emits all remote endpoints on the cluster (except endpoints that were added within the creation of Discovery)
```

After a node joins a cluster and subscribes to it, it will be notified on all the changes of endpoints within the cluster (emits each time some endpoints are added or removed from the cluster).
To remove the node from the cluster use discovery.destroy()

```javascript
discovery.destroy().then(console.log); // random-node-identifier has been removed from cluster1
```
