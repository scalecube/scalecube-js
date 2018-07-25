import { RSocketProvider } from 'src/scalecube-transport/provider/Rsocket';

describe('Rsocket tests', () => {
  it('Test', async (done) => {
    const rSocketProvider = new RSocketProvider();
    await rSocketProvider.connect();
    const stream = rSocketProvider.request({
      type: 'requestResponse',
      serviceName: 'greeting',
      actionName: 'pojo/one',
      data: { text: 'Some text to be tested' }
    });
    stream.subscribe((data) => {
      console.log('data', data);
      done();
    });

  })
});
