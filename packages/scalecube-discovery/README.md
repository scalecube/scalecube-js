[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> **NOTICE** versions 0.1.x are experimental without LTS or the API and behavior might change from patch to patch

# Discovery

Discovery is used that publish and discover values in a distributed environment.

## Basic Usage

```javascript
const discoveryConfig = {
  seedAddress: 'defaultEnvironment', // string
  address: 'random-discovery-identifier', // string
  itemsToPublish: [], // Item[]
};
const discovery = createDiscovery(discoveryConfig);
```

After the creation of the discovery, it is possible to subscribe to discoveredItems\$()
and then to receive information about the other discoveries that join the same environment ('seedAddress')

```javascript
discovery.discoveredItems$().subscribe(console.log); // emits all values from the other discoveries that are joining the same 'seedAddress'
```

After the creation of the discovery, it is possible to remove it by destroy()
destroy will complete the stream, remove the discovery's data from the environment
and notify all other discoveries about the change.

```javascript
discovery.destroy().then(console.log); // random-discovery-identifier has been removed from defaultEnvironment
```
