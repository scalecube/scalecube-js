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
          ports: transfer ? transfer : undefined,
        });
        dispatchEvent(event);
      } else {
        // @ts-ignore
        postMessage(data, transfer ? transfer : undefined);
      }
    } else {
      if (data.type === 'ConnectWorkerEvent') {
        return;
      }
      postMessage(data, '*', transfer ? transfer : undefined);
    }
  } catch (e) {
    console.error('Unable to post message ', e);
  }
};
