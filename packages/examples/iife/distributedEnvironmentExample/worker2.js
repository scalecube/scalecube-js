importScripts('http://localhost:8000/packages/browser/dist/index.js');
importScripts('./definitions.js');
importScripts('./reactiveStream.js');
onmessage = (ev) => {
  const { data } = ev;
  if (data.type === 'start') {
    switch (data.detail) {
      case 'ms5':
        sc.createMicroservice({
          services: [
            {
              reference: reactiveStreamExample,
              definition: definitions.remoteServiceDefinition5,
            },
          ],
          address: 'ms5',
          seedAddress: 'ms4',
        });
        break;
      case 'ms2':
        sc.createMicroservice({
          services: [
            {
              reference: reactiveStreamExample,
              definition: definitions.remoteServiceDefinition2,
            },
          ],
          address: 'ms2',
          seedAddress: 'ms1',
        });
        break;
    }
  }
};
