/**
 * webWorker example,
 * using a worker thread to run microservice container
 *
 * then requesting from the worker to run a service
 *
 */

window.addEventListener('DOMContentLoaded', (event) => {
  ((createMicroservice, ASYNC_MODEL_TYPES, definitions) => {
    const placeHolder1 = document.getElementById('placeHolder');
    const placeHolder2 = document.getElementById('placeHolder2');
    const waitMessage = document.getElementById('waitMessage');

    waitMessage.innerText = 'Wait for service ~ 2s';

    const worker = new Worker('worker1.js');
    const worker2 = new Worker('worker2.js');

    const connect = connectWorkers();
    connect.addWorker({ address: 'pm://defaultHost:8080/worker', worker });
    connect.addWorker({ address: 'pm://defaultHost:8080/worker3', worker });
    connect.addWorker({ address: 'pm://defaultHost:8080/worker2', worker: worker2 });

    const localMS = createMicroservice({ services: [], address: 'main', seedAddress: 'worker' });
    const proxyConfig = {
      proxies: [
        {
          serviceDefinition: definitions.remoteServiceDefinition,
          proxyName: 'awaitProxyName',
        },
        {
          serviceDefinition: definitions.remoteServiceDefinition2,
          proxyName: 'awaitProxyName2',
        },
        {
          serviceDefinition: definitions.remoteServiceDefinition3,
          proxyName: 'awaitProxyName3',
        },
      ],
      isAsync: true,
    };
    const { awaitProxyName, awaitProxyName2, awaitProxyName3 } = localMS.createProxies(proxyConfig);

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

    awaitProxyName3.then(({ proxy: serviceNameProxy }) => {
      console.log('remote service3 is available!');
      let i = 0;
      for (i; i < 5; i++) {
        serviceNameProxy
          .bubbleSortTime()
          .then((response) => {
            console.log('3333', response);
          })
          .catch(console.log);
      }
    });

    const createLineHTML = ({ response, type, placeHolder }) => {
      waitMessage.innerText = 'Service is available from workers:';

      const responseSpan = document.createElement('div');
      responseSpan.innerText = `${type}: start at ${response.start}, end at ${response.end}, time ${response.time}`;
      placeHolder.appendChild(responseSpan);
    };
  })(window.sc.createMicroservice, window.sc.ASYNC_MODEL_TYPES, definitions);
});

const connectWorkers = () => {
  let workersMap = {};
  addEventListener('message', (ev) => {
    if (ev && ev.data && !ev.data.workerId) {
      if (ev.data.detail) {
        const propogateTo = workersMap[ev.data.detail.to] || workersMap[ev.data.detail.address]; //discoveryEvents || rsocketEvents
        console.log('window -> propogateTo', ev.data);
        propogateTo
          ? propogateTo.postMessage(ev.data, ev.ports || undefined)
          : postMessage(ev.data, '*', ev.ports || undefined);
      }
    }
  });

  return {
    addWorker: ({ address, worker }) => {
      workersMap = {
        ...workersMap,
        [address]: worker,
      };

      // allWorker.push(worker);
      worker.addEventListener('message', (ev) => {
        if (!ev.data.workerId) {
          ev.data.workerId = 1;

          const propogateTo = workersMap[ev.data.detail.to] || workersMap[ev.data.detail.address]; //discoveryEvents || rsocketEvents
          console.log('worker -> propogateTo', ev.data);
          propogateTo
            ? propogateTo.postMessage(ev.data, ev.ports || undefined)
            : postMessage(ev.data, '*', ev.ports || undefined);
        }
      });
    },
  };
};
