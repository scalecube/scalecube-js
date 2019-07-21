importScripts('http://localhost:8000/packages/scalecube-microservice/dist/index.js');
importScripts('./definitions.js');
importScripts('./reactiveStream.js');

onmessage = (ev) => {
  const { data } = ev;
  if (data.type === 'start') {
    switch (data.detail) {
      case 'ms1':
        sc.createMicroservice({
          services: [
            {
              reference: reactiveStreamExample,
              definition: definitions.remoteServiceDefinition1,
            },
          ],
          address: 'ms1',
        });
        break;
      case 'ms3':
        sc.createMicroservice({
          services: [
            {
              reference: reactiveStreamExample,
              definition: definitions.remoteServiceDefinition3,
            },
          ],
          address: 'ms3',
          seedAddress: 'ms1',
        });
        break;
      case 'ms4':
        sc.createMicroservice({
          services: [
            {
              reference: reactiveStreamExample,
              definition: definitions.remoteServiceDefinition4,
            },
          ],
          address: 'ms4',
          seedAddress: 'ms2',
        });
        break;
    }
  }
};
