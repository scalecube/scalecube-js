window.addEventListener('DOMContentLoaded', (event) => {
  ((createMicroservice, workers, ASYNC_MODEL_TYPES, definitions) => {
    workers.initialize();
    workers.addIframe(document.getElementById('iframe'));
    const proxy = createMicroservice({
      // seedAddress: 'iframe',
      address: 'main',
      services: [
        {
          definition: definitions.remoteServiceDefinition2,
          reference: {
            ack2: () => Promise.resolve('ack2'),
          },
        },
      ],
      debug: true,
    }).createProxy({
      serviceDefinition: definitions.remoteServiceDefinition,
    });

    proxy.ack1().then((response) => {
      console.log('proxy1', response);
    });
  })(window.sc.createMicroservice, window.sc.workers, window.sc.ASYNC_MODEL_TYPES, definitions);
});
