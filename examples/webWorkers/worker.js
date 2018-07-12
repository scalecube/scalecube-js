// @flow

 const cluster = new Cluster();




onmessage = function(oEvent) {
  if(oEvent.data.type === 'join'){
    cluster.join(oEvent.cluster);
  } else if(oEvent.data.type === 'get') {
    postMessage(cluster);
  }
};