var definitions = (function() {
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
    remoteServiceDefinition,
  };
})();
