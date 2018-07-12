// @flow

let workerA = new Worker('worker.js');
let workerB = new Worker('worker.js');

workerA.postMessage({
  type: 'seed',
  cluster: ''
});