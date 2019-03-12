<!-- prettier-ignore -->

[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> **NOTICE** versions 0.0.x are experimental without LTS or the API and behavior might change from patch to patch

# Discovery
Discovery is a tool used by [scalecube](packages/scalecube-microservice/README.md) to access available microservices on a cluster of microservices.

## Basic Usage
```javascript

const discoveryConfig = {
  seedAddress : 'namespace', // string
  address : 'random identifier', // string
  endPoints: [] // Endpoint[]
}

const node = Discovery.create(discoveryConfig);

node.notifier.subscribe(console.log); // emit all remote endpoints on the cluster(seedAddress)
```

After a node join the cluster and subscribe to it, then it will be notified on all new endpoints that join the cluster.
To remove node from the cluster use node.destroy
```javascript
node.end(); // remove node microservices from the cluster and unsubscribe from the cluster.
```
