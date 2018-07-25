import { RSocketProvider } from 'src/scalecube-transport/provider/Rsocket';

describe('Rsocket tests', () => {
  it('Test', async (done) => {
    const rSocketProvider = new RSocketProvider();
    rSocketProvider.buildClient();
    const { socket, cancel } = await rSocketProvider.connect();
    const flowablePojoOne = socket.requestResponse({
      data: {
        text: 'Some text to be tested'
      },
      metadata: {
        q: '/greeting/pojo/one'
      },
    });

    flowablePojoOne.subscribe({
      onComplete: (data) => {
        expect(data).toEqual({
          data: {
            text: 'Echo:Some text to be tested'
          },
          metadata: {
            q: '/greeting/pojo/one'
          },
        });
        console.log('data onComplete', data);
        done();
      },
      onError: error => console.error(error),
      onSubscribe: cancelFlowable => {  }
    });
  })
});
