definitions = (function() {
  var remoteServiceDefinition1 = {
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

  var remoteServiceDefinition3 = {
    serviceName: 'RemoteService3',
    methods: {
      ack3: {
        asyncModel: 'requestResponse',
      },
    },
  };

  return {
    remoteServiceDefinition1,
    remoteServiceDefinition2,
    remoteServiceDefinition3,
  };
})();
