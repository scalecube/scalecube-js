import Worker from 'tiny-worker';

export const executeWorkerContent = function() {
  const Observable = require('rxjs').Observable;
  const getTextResponseSingle = text => `Echo:${text}`;
  const getTextResponseMany = index => text => `Greeting (${index}) to: ${text}`;
  const getFailingOneResponse = text => ({ errorCode: 500, errorMessage: text });
  const getFailingManyResponse = text => ({ errorCode: 500, errorMessage: getTextResponseSingle(text) });

  self.onmessage = ({ data: { entrypoint, data, requestId } }) => {
    if (entrypoint === '/greeting/one') {
      postMessage({ requestId, data: getTextResponseSingle(data), completed: false });
      postMessage({ requestId, data: undefined, completed: true });
    }
    if (entrypoint === '/greeting/pojo/one') {
      postMessage({ requestId, data: { text: getTextResponseSingle(data.text) }, completed: false });
      postMessage({ requestId, data: undefined, completed: true });
    }
    if (entrypoint === '/greeting/many') {
      Observable.interval(100)
        .subscribe(
          result => postMessage({ requestId, data: getTextResponseMany(result)(data), completed: false }),
          (error) => {},
          () => postMessage({ requestId, data: undefined, completed: true })
        );
    }
    if (entrypoint === '/greeting/failing/one') {
      postMessage({ requestId, data: getFailingOneResponse(data), completed: false });
      postMessage({ requestId, data: undefined, completed: true });
    }
    if (entrypoint === '/greeting/failing/many') {
      postMessage({ requestId, data: getTextResponseSingle(data), completed: false });
      postMessage({ requestId, data: getTextResponseSingle(data), completed: false });
      postMessage({ requestId, data: getFailingManyResponse(data), completed: false });
      postMessage({ requestId, data: undefined, completed: true });
    }
  };
};

export const httpURI = 'https://localhost:8080';
export const socketURI = 'ws://localhost:8080';

export const setWorkers = (URI) => {
  window.workers = {
    [URI]: new Worker(executeWorkerContent)
  };
};

export const removeWorkers = () => {
  Object.values(window.workers).forEach(worker => worker.terminate && worker.terminate());
  window.workers = undefined;
};

