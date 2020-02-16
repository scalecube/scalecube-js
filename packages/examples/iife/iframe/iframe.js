window.addEventListener('DOMContentLoaded', (event) => {
  ((createMicroservice, workers, ASYNC_MODEL_TYPES, definitions) => {
    const proxy = createMicroservice({
      seedAddress: 'main',
      address: 'iframe',
      services: [
        {
          definition: definitions.remoteServiceDefinition,
          reference: {
            ack1: () => Promise.resolve('ack'),
          },
        },
      ],
      debug: true,
    }).createProxy({
      serviceDefinition: definitions.remoteServiceDefinition2,
    });

    const root = document.getElementById('root');
    root.innerHTML = 'no event yet';
    proxy.ack2().then((response) => {
      root.innerHTML = response;
    });
  })(window.sc.createMicroservice, window.sc.workers, window.sc.ASYNC_MODEL_TYPES, definitions);
});
