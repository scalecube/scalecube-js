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

    workers.initialize();

    const worker = new Worker('worker1.js');
    const worker2 = new Worker('worker2.js');

    workers.addWorker(worker);
    workers.addWorker(worker2);

    const localMS = createMicroservice({ services: [], address: 'main' });

    const proxy1 = localMS.createProxy({ serviceDefinition: definitions.remoteServiceDefinition });
    const proxy2 = localMS.createProxy({ serviceDefinition: definitions.remoteServiceDefinition2 });

    let i = 0;
    for (i; i < 5; i++) {
      proxy1
        .bubbleSortTime()
        .then((response) => {
          createLineHTML({ response, type: ASYNC_MODEL_TYPES.REQUEST_RESPONSE, placeHolder: placeHolder1 });
        })
        .catch(console.log);
    }

    let y = 0;
    for (y; y < 5; y++) {
      proxy2
        .bubbleSortTime()
        .then((response) => {
          createLineHTML({ response, type: ASYNC_MODEL_TYPES.REQUEST_RESPONSE, placeHolder: placeHolder2 });
        })
        .catch(console.log);
    }

    const createLineHTML = ({ response, type, placeHolder }) => {
      waitMessage.innerText = 'Service is available from workers:';

      const responseSpan = document.createElement('div');
      responseSpan.innerText = `${type}: start at ${response.start}, end at ${response.end}, time ${response.time}`;
      placeHolder.appendChild(responseSpan);
    };
  })(window.sc.createMicroservice, window.sc.workers, window.sc.ASYNC_MODEL_TYPES, definitions);
});
