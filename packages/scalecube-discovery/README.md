[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> **NOTICE** versions 0.1.x are experimental without LTS or the API and behavior might change from patch to patch

# Discovery

This package provides a default discovery implementation.
it is intended to publish and discover any data in a distributed environment.

## Basic Usage

```javascript
import { createDiscovery } from '@scalecube/scalecube-discovery';

const discoveryConfig = {
  seedAddress,
  address,
  itemsToPublish: [],
};

const discovery = createDiscovery(discoveryConfig);

// on subscribe to `discoveredItems$()`, we will start getting emits of the distributed environment's latest state.
discovery.discoveredItems$().subscribe(console.log); 


// on calling `destroy()`, we will remove our metadata from the distributed environment. 
// also, it stops the discovery from sharing/publishing metadata.
discovery.destroy().then(console.log); 
```
