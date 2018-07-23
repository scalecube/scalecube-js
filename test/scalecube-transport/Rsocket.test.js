import { createClient } from 'src/scalecube-transport/provider/Rsocket';

describe('Rsocket tests', () => {
  it('Test', (done) => {
    createClient();

    setTimeout(() => {
      done();
    }, 2000)
  })
})
