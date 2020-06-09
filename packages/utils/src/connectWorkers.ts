import { isNodejs } from './checkEnvironemnt';

const workersMap: { [key: string]: Worker } = {};
const registeredIframes: { [key: string]: any } = {};
const iframes: HTMLIFrameElement[] = [];
/**
 * check from which iframe the event arrived,
 * @param ev
 */
const registerIframe = (ev: any) => {
  iframes.some((iframe: HTMLIFrameElement) => {
    if (ev.source === iframe.contentWindow) {
      registeredIframes[ev.data.detail.whoAmI || ev.data.detail.origin] = iframe;
    }
    return ev.source === iframe.contentWindow;
  });
};

export const initialize = () => {
  if (!isNodejs()) {
    // @ts-ignore
    if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
      console.warn(`Don't use this on webworkers, only on the main thread`);
    } else {
      addEventListener('message', (ev) => {
        if (ev && ev.data && !ev.data.workerId) {
          ev.data.type === 'ConnectIframe' && registerIframe(ev);
          const detail = ev.data.detail;
          if (detail) {
            ev.data.workerId = 1;
            const propogateTo = workersMap[detail.to] || workersMap[detail.address]; // discoveryEvents || rsocketEvents
            if (propogateTo) {
              // @ts-ignore
              propogateTo.postMessage(ev.data, ev.ports);
            }

            const iframe = registeredIframes[detail.to] || registeredIframes[detail.address];
            if (iframe) {
              iframe.contentWindow.postMessage(ev.data, '*', ev.ports);
            }
          }
        }
      });
    }
  }
};

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

export const addIframe = (iframe: HTMLIFrameElement) => {
  iframes.push(iframe);
};
