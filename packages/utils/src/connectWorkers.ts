import { isNodejs } from './checkEnvironemnt';

const workersMap: { [key: string]: Worker } = {};

if (!isNodejs()) {
  // @ts-ignore
  if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    console.error(`Don't use this on webworkers, only on the main thread`);
  } else {
    addEventListener('message', (ev) => {
      if (ev && ev.data && !ev.data.workerId) {
        if (ev.data.detail) {
          ev.data.workerId = 1;
          const propogateTo = workersMap[ev.data.detail.to] || workersMap[ev.data.detail.address]; // discoveryEvents || rsocketEvents
          if (propogateTo) {
            // @ts-ignore
            propogateTo.postMessage(ev.data, ev.ports);
          }
        }
      }
    });
  }
}

function workerEventHandler(ev: any) {
  if (ev.data && ev.data.detail && ev.data.type) {
    const detail = ev.data.detail;
    if (!ev.data.workerId) {
      ev.data.workerId = 1;

      if (ev.data.type === 'ConnectWorkerEvent') {
        if (detail.whoAmI) {
          // @ts-ignore
          workersMap[detail.whoAmI] = this;
        }
      } else {
        const propogateTo = workersMap[detail.to] || workersMap[detail.address]; // discoveryEvents || rsocketEvents
        if (propogateTo) {
          // @ts-ignore
          propogateTo.postMessage(ev.data, ev.ports);
        } else {
          // @ts-ignore
          postMessage(ev.data, '*', ev.ports);
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
