definitions = (function() {
  var remoteServiceDefinition = {
    serviceName: 'RemoteService1',
    methods: {
      ack1: {
        asyncModel: 'requestResponse',
      },
    },
  };

  var remoteServiceDefinition2 = {
    serviceName: 'RemoteService2',
    methods: {
      ack2: {
        asyncModel: 'requestResponse',
      },
    },
  };

  return {
    remoteServiceDefinition,
    remoteServiceDefinition2,
  };
})();
