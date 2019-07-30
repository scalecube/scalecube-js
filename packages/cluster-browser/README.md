[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> **NOTICE** versions 0.0.x are experimental without LTS or the API and behavior might change from patch to patch

# Cluster-browser

This package provides a default cluster implementation for browser.
it uses native browser message event for creating the distributed environment.

## Basic Usage

```javascript
import { joinCluster } from '@scalecube/cluster-browser';

const clusterOptions = {
  seedAddress,
  address,
  itemsToPublish: [],
};

const cluster = joinCluster(clusterOptions);

// calling `getCurrentMembersData()`, will resolve with the distributed environment's latest state.
cluster.getCurrentMembersData().then(console.log); 

// on subscribe to `listen$()`, we will start getting emits of the distributed environment's latest state.
cluster.listen$().subscribe(console.log); 


// on calling `destroy()`, we will remove our metadata from the distributed environment. 
// also, it stops the cluster from sharing/publishing metadata.
cluster.destroy().then(console.log); 
```
