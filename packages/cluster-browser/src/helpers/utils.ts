export const getKeysAsArray = (obj: {}) => (obj && Object.keys(obj)) || [];

let localAddress: any[] = [];

export const setLocalAddress = (address: string) => {
  localAddress = [...localAddress, address];
  return localAddress;
};

export const genericPostMessage = (data: any, transfer?: any[]) => {
  try {
    // @ts-ignore
    if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
      if (data.detail && data.detail.to && localAddress.indexOf(data.detail.to) > -1) {
        const event = new MessageEvent('message', {
          data,
          ports: transfer,
        });
        dispatchEvent(event);
      } else {
        // @ts-ignore
        postMessage(data, transfer);
      }
    } else {
      if (data.type === 'ConnectWorkerEvent') {
        return;
      }

      if (window.self !== window.top) {
        // @ts-ignore
        window.parent && window.parent.postMessage(data, '*', transfer);
      } else {
        postMessage(data, '*', transfer);
      }
    }
  } catch (e) {
    console.error('Unable to post message ', e);
  }
};
