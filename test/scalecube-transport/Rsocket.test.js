import { RSocketProvider } from 'src/scalecube-transport/provider/RSocketProvider';

describe('Rsocket tests', () => {

  const serviceName = 'greeting';
  const text = 'Test text';
  const url = 'ws://localhost:8080';

  it('Use requestResponse type with "one" action', async (done) => {
    expect.assertions(2);

    const rSocketProvider = new RSocketProvider({ url });
    await rSocketProvider.connect();
    const stream = rSocketProvider.request({
      serviceName,
      type: 'requestStream',
      actionName: 'one',
      data: text
    });
   stream.subscribe(
      (data) => {
        expect(data).toEqual(`Echo:${text}`);
      },
      undefined,
      () => {
        expect('Stream has been completed').toBeTruthy();
        done();
      }
    );
  });

});
