import { Worker } from 'webworker-threads';

describe('PostMessage tests', () => {

  it('Test webworker-threads', (done) => {
    const worker = new Worker(function() {
      this.postMessage("I'm working before postMessage('ali').");
      this.onmessage = function(event) {
        console.log('received');
        this.postMessage('Hi ' + event.data);
        this.close();
      };
    });

    worker.onmessage = function(event) {
      console.log("Worker said : " + event.data);
      done();
    };
    worker.postMessage('ali');
  });

});
