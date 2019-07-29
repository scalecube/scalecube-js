/**
 * webWorker example,
 * using a worker thread to run microservice container
 *
 * then requesting from the worker to run a service
 *
 */

window.addEventListener('DOMContentLoaded', (event) => {
  ((createMicroservice, workers, ASYNC_MODEL_TYPES, definitions) => {
    const placeHolder1 = document.getElementById('placeHolder');
    const placeHolder2 = document.getElementById('placeHolder2');
    const waitMessage = document.getElementById('waitMessage');

    waitMessage.innerText = 'Wait for service ~ 2s';

    const worker = new Worker('worker1.js');
    const worker2 = new Worker('worker2.js');

    workers.addWorker(worker);
    workers.addWorker(worker2);

    const localMS = createMicroservice({ services: [], address: 'ms', seedAddress: 'ms2' });
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
      console.log(`main - awaitProxyName is ready: `);
      serviceNameProxy.getInterval().subscribe(
        (response) => {
          createLineHTML({ response, type: ASYNC_MODEL_TYPES.REQUEST_STREAM, placeHolder: placeHolder1 });
        },
        (error) => console.log(error.message)
      );
    });

    awaitProxyName2.then(({ proxy: serviceNameProxy }) => {
      console.log(`main - awaitProxyName2 is ready: `);
      serviceNameProxy.getInterval().subscribe(
        (response) => {
          createLineHTML({ response, type: ASYNC_MODEL_TYPES.REQUEST_STREAM, placeHolder: placeHolder2 });
        },
        (error) => console.log(error.message)
      );
    });

    awaitProxyName3.then(({ proxy: serviceNameProxy }) => {
      console.log(`main - awaitProxyName3 is ready: `);
      serviceNameProxy.getInterval(2000).subscribe(
        (response) => {
          console.log(`main - awaitProxyName3 resolve every 2000ms ${response}`);
        },
        (error) => console.log(error.message)
      );
    });

    const createLineHTML = ({ response, type, placeHolder }) => {
      waitMessage.innerText = 'Service is available from workers:';

      const responseSpan = document.createElement('div');
      responseSpan.innerText = `${type}: resolves every 2000ms (default) ${response}`;
      placeHolder.appendChild(responseSpan);
    };

    setTimeout(() => {
      localMS.destroy();
    }, 60 * 1 * 1000);
  })(window.sc.createMicroservice, window.sc.workers, window.sc.ASYNC_MODEL_TYPES, definitions);
});
