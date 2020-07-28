export const applyPostMessagePolyfill = () => {
  const addEventListenerQueue: { [key: string]: any[] } = {};
  // @ts-ignore
  global.postMessage = (message, targetOrigin, transfer) => {
    const onMessageQueue = addEventListenerQueue.message || [];
    onMessageQueue.forEach((fn: any) => {
      fn({
        ports: transfer,
        data: message,
        type: 'message',
      });
    });
  };

  const globaladdEventListener = addEventListener;
  // @ts-ignore
  addEventListener = (type, cb) => {
    if (type === 'message') {
      const eventQueueByType = [...(addEventListenerQueue[type] || []), cb];
      addEventListenerQueue[type] = eventQueueByType;
    } else {
      globaladdEventListener(type, cb);
    }
  };
};
