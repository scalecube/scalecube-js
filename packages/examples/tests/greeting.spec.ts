jest.setTimeout(120000);
describe('k8s', () => {
  test('k8s', async (done) => {
    expect.assertions(1);
    const { execSync } = require('child_process');
    execSync('/bin/bash -c "cd k8s && ./start"', { stdio: 'inherit' });
    const http = require('http');
    // how many times to try before failing
    // the cluster require some time to get ready for action
    let tries = 6;
    try {
      setInterval(() => {
        http
          .get('http://localhost:8080/?name=test', (resp: any) => {
            let data = '';
            // A chunk of data has been recieved.
            resp.on('data', (chunk: any) => {
              data += chunk;
            });
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
              expect(data).toBe('"hello: test"');
              execSync('/bin/bash -c "cd k8s && ./stop"', { stdio: 'inherit' });
              done();
            });
            resp.on('error', (err: Error) => {
              throw Error('Service responded with error: ' + err.message);
            });
          })
          .on('error', (err: Error) => {
            tries--;
            if (tries <= 0) {
              throw Error('http get error: ' + err.message);
            }
          });
      }, 10000);
    } catch (e) {
      execSync('/bin/bash -c "cd k8s && ./stop"', { stdio: 'inherit' });
    }
  });
});
