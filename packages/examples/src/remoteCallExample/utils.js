var utils = (function() {
  var generateAddress = (port) => ({
    host: 'defaultHostName',
    port,
    path: 'defaultPathName',
    protocol: 'pm',
    fullAddress: `pm://defaultHostName:${port}/path`,
  });

  var remoteServiceDefinition = {
    serviceName: 'RemoteService',
    methods: {
      hello: {
        asyncModel: 'requestResponse',
      },
      greet$: {
        asyncModel: 'requestStream',
      },
    },
  };

  return {
    generateAddress,
    remoteServiceDefinition,
  };
})();
