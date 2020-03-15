window.addEventListener('DOMContentLoaded', (event) => {
  ((createMicroservice, workers, ASYNC_MODEL_TYPES, definitions) => {
    const proxy = createMicroservice({
      seedAddress: 'main',
      address: 'iframe',
      services: [
        {
          definition: definitions.remoteServiceDefinition1,
          reference: {
            ack1: () => Promise.resolve('ack'),
          },
        },
      ],
      debug: true,
    }).createProxy({
      serviceDefinition: definitions.remoteServiceDefinition2,
    });

    const ms = createMicroservice({
      seedAddress: 'iframe', // 'main'
      address: 'iframe2',
      debug: true,
      services: [
        {
          definition: definitions.remoteServiceDefinition3,
          reference: {
            ack3: () => Promise.resolve('ack3'),
          },
        },
      ],
    });

    const proxy2 = ms.createProxy({
      serviceDefinition: definitions.remoteServiceDefinition1,
    });

    const proxy3 = ms.createProxy({
      serviceDefinition: definitions.remoteServiceDefinition4,
    });

    const ack1 = document.getElementById('ack1');
    const ack2 = document.getElementById('ack2');
    const ack4 = document.getElementById('ack4');
    ack1.innerHTML = 'no event yet - remote service on main';
    ack2.innerHTML = 'no event yet - remote service on the same iframe';
    ack4.innerHTML = 'no event yet - remote service on worker';

    proxy.ack2().then((response) => {
      ack1.innerHTML = `receive ${response} from remote service on the main`;
    });

    proxy2.ack1().then((response) => {
      ack2.innerHTML = `receive ${response} from remote service on the same iframe`;
    });

    proxy3.ack4().then((response) => {
      ack4.innerHTML = `receive ${response} from remote service on worker`;
    });
  })(window.sc.createMicroservice, window.sc.workers, window.sc.ASYNC_MODEL_TYPES, definitions);
});
