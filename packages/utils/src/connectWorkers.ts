const workersMap: { [key: string]: Worker } = {};

// @ts-ignore
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  console.warn(`Don't use this on webworkers, only on the main thread`);
} else {
  addEventListener('message', (ev) => {
    if (ev && ev.data && !ev.data.workerId) {
      if (ev.data.detail) {
        ev.data.workerId = 1;
        const propogateTo = workersMap[ev.data.detail.to] || workersMap[ev.data.detail.address]; // discoveryEvents || rsocketEvents
        if (propogateTo) {
          // console.log('window -> propogateTo', ev.data);
          // @ts-ignore
          propogateTo.postMessage(ev.data, ev.ports || undefined);
        }
      }
    }
  });
}

function workerEventHandler(ev: any) {
  if (ev.data && ev.data.detail && ev.data.type) {
    if (!ev.data.workerId) {
      ev.data.workerId = 1;

      if (ev.data.type === 'ConnectWorkerEvent') {
        if (ev.data.detail.whoAmI) {
          // @ts-ignore
          workersMap[ev.data.detail.whoAmI] = this;
        }
      } else {
        const propogateTo = workersMap[ev.data.detail.to] || workersMap[ev.data.detail.address]; // discoveryEvents || rsocketEvents
        // console.log('worker -> propogateTo', ev.data);
        if (propogateTo) {
          // @ts-ignore
          propogateTo.postMessage(ev.data, ev.ports || undefined);
        } else {
          // @ts-ignore
          postMessage(ev.data, '*', ev.ports || undefined);
        }
      }
    }
  }
}

export const addWorker = (worker: Worker) => {
  worker.addEventListener('message', workerEventHandler.bind(worker));
};

export const removeWorker = (worker: Worker) => {
  worker.removeEventListener('message', workerEventHandler.bind(worker));
};
