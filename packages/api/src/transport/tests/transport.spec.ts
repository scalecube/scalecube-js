describe('transport suite', () => {
  test('Transport.ClientTransport.start should return Promise to invoker', () => {
    // when promise resolved invoker should be ready
  });
  test('Transport.ClientTransport.destroy should trigger error for all open invocation', () => {});
  test('Transport.ServerTransport should open a transport server and return destroy function', () => {});
  test('Server destroy function should unsubscribe all streams and emit error for all open requests', () => {});
  test('Invoker.RequestResponse Ping pong', () => {});
  test('Invoker.RequestResponse Ping error', () => {});
  test('Invoker.RequestStream ^-A-B-C-$ test', () => {});
  test('Invoker.RequestStream ^-A-B-C-! test', () => {});
});
