definitions = (function() {
  var remoteServiceDefinition = {
    serviceName: 'RemoteService1',
    methods: {
      getInterval: {
        asyncModel: 'requestStream',
      },
    },
  };

  var remoteServiceDefinition2 = {
    serviceName: 'RemoteService2',
    methods: {
      getInterval: {
        asyncModel: 'requestStream',
      },
    },
  };

  var remoteServiceDefinition3 = {
    serviceName: 'RemoteService3',
    methods: {
      getInterval: {
        asyncModel: 'requestStream',
      },
    },
  };

  return {
    remoteServiceDefinition,
    remoteServiceDefinition2,
    remoteServiceDefinition3,
  };
})();
