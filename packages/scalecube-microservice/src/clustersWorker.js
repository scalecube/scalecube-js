onconnect = function(e) {
  console.log('ports in SharedWorker', e.ports);
  var port1 = e.ports[0];

  port1.addEventListener('message', function(e) {
    var workerResult = 'Result 1: ' + e.data[0] * e.data[1];
    port.postMessage(workerResult);
  });

  var port2 = e.ports[1];

  port2.addEventListener('message', function(e) {
    var workerResult = 'Result 2: ' + e.data[0] * e.data[1];
    port.postMessage(workerResult);
  });

  port1.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
  port2.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
};
