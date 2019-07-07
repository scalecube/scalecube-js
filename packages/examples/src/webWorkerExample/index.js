/**
 * webWorker example,
 * using a worker thread to run microservice container
 *
 * then requesting from the worker to run a service
 *
 */

window.addEventListener('DOMContentLoaded', (event) => {
  (function(Microservices, ASYNC_MODEL_TYPES, definitions) {
    var placeHolder1 = document.getElementById('placeHolder');
    var placeHolder2 = document.getElementById('placeHolder2');
    var waitMessage = document.getElementById('waitMessage');

    waitMessage.innerText = 'Wait for service ~ 2s';

    var worker = new Worker('worker1.js');
    var worker2 = new Worker('worker2.js');

    var connect = connectWorkers();
    connect.addWorker(worker);
    connect.addWorker(worker2);

    var localMS = Microservices.create({ services: [], address: 'main' });
    var proxyConfig = {
      proxies: [
        {
          serviceDefinition: definitions.remoteServiceDefinition,
          proxyName: 'awaitProxyName',
        },
        {
          serviceDefinition: definitions.remoteServiceDefinition2,
          proxyName: 'awaitProxyName2',
        },
      ],
      isAsync: true,
    };
    var { awaitProxyName, awaitProxyName2 } = localMS.createProxies(proxyConfig);

    awaitProxyName.then(({ proxy: serviceNameProxy }) => {
      console.log('remote service is available!');
      let i = 0;
      for (i; i < 5; i++) {
        serviceNameProxy
          .bubbleSortTime()
          .then((response) => {
            createLineHTML({ response, type: ASYNC_MODEL_TYPES.REQUEST_RESPONSE, placeHolder: placeHolder1 });
          })
          .catch(console.log);
      }
    });

    awaitProxyName2.then(({ proxy: serviceNameProxy }) => {
      console.log('remote service2 is available!');
      let i = 0;
      for (i; i < 5; i++) {
        serviceNameProxy
          .bubbleSortTime()
          .then((response) => {
            createLineHTML({ response, type: ASYNC_MODEL_TYPES.REQUEST_RESPONSE, placeHolder: placeHolder2 });
          })
          .catch(console.log);
      }
    });

    function createLineHTML({ response, type, placeHolder }) {
      waitMessage.innerText = 'Service is available from workers:';

      var responseSpan = document.createElement('div');
      responseSpan.innerText = `${type}: start at ${response.start}, end at ${response.end}, time ${response.time}`;
      placeHolder.appendChild(responseSpan);
    }
  })(window.sc.Microservices, window.sc.ASYNC_MODEL_TYPES, definitions);
});

var connectWorkers = function() {
  var workersMap = {};

  addEventListener('message', (ev) => {
    if (ev && ev.data && !ev.data.workerId) {
      if (ev.data.detail) {
        // console.log('window to worker: ', ev.data, workersMap);
        var propogateTo = workersMap[ev.data.detail.to] || workersMap[ev.data.detail.address]; //discoveryEvents || rsocketEvents
        propogateTo && propogateTo.postMessage(ev.data, ev.ports || undefined);
      }
    }
  });

  return {
    addWorker: function(worker) {
      worker.addEventListener('message', (ev) => {
        if (ev && ev.data && ev.data.type === 'membershipEventInitServer') {
          workersMap = {
            ...workersMap,
            [ev.data.detail.origin]: worker,
          };
        }

        ev.data.workerId = 1;
        // console.log('worker to window: ', ev.data);
        postMessage(ev.data, '*', ev.ports || undefined);
      });
    },
  };
};
