/**
 * webWorker example,
 * using a worker thread to run microservice container
 *
 * then requesting from the worker to run a service
 *
 */

window.addEventListener('DOMContentLoaded', (event) => {
  (function(Microservices, ASYNC_MODEL_TYPES, definitions) {
    var placeHolder = document.getElementById('placeHolder');
    var placeHolder2 = document.getElementById('placeHolder2');
    var waitMessage = document.getElementById('waitMessage');

    waitMessage.innerText = 'Wait for service ~ 2s';

    var worker = new Worker('worker1.js');
    // var worker2 = new Worker('worker2.js');

    worker.addEventListener('message', (ev) => {
      ev.workerId = 1;
      console.log('worker to window: ', ev.data);
      postMessage(ev.data, '*', ev.ports || undefined);
    });

    // worker2.addEventListener('message', (ev) => {
    //   ev.workerId = 2;
    //   postMessage(ev.data, '*', ev.ports || undefined);
    // });

    addEventListener('message', (ev) => {
      if (!ev.workerId) {
        console.log('window to worker: ', ev.data);
        worker.postMessage(ev.data, ev.ports || undefined);
      }

      // if ( ev.workerId !== 2 ) {
      //   worker2.postMessage(ev.data, ev.ports || undefined);
      // }
    });

    var localMS = Microservices.create({ services: [], address: 'main' });
    var proxyConfig = {
      proxies: [
        {
          serviceDefinition: definitions.remoteServiceDefinition,
          proxyName: 'awaitProxyName',
        },
        // {
        //   serviceDefinition: definitions.remoteServiceDefinition2,
        //   proxyName: 'awaitProxyName2',
        // }
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
            createLineHTML({ response, type: ASYNC_MODEL_TYPES.REQUEST_RESPONSE, placeHolder });
          })
          .catch(console.log);
      }
    });

    // awaitProxyName2.then(({ proxy: serviceNameProxy }) => {
    //   console.log('remote service2 is available!');
    //   let i = 0;
    //   for ( i; i < 5; i++ ) {
    //     serviceNameProxy
    //       .bubbleSortTime()
    //       .then((response) => {
    //         createLineHTML({ response, type: ASYNC_MODEL_TYPES.REQUEST_RESPONSE, placeHolder: placeHolder2 });
    //       })
    //       .catch(console.log);
    //   }
    // });

    function createLineHTML({ response, type, placeHolder }) {
      waitMessage.innerText = 'Service is available:';

      var responseSpan = document.createElement('div');
      responseSpan.innerText = `${type}: start at ${response.start}, end at ${response.end}, time ${response.time}`;
      placeHolder.appendChild(responseSpan);
    }
  })(window.sc.Microservices, window.sc.ASYNC_MODEL_TYPES, definitions);
});
