definitions = (function() {
  var remoteServiceDefinition = {
    serviceName: 'RemoteService1',
    methods: {
      bubbleSortTime: {
        asyncModel: 'requestResponse',
      },
    },
  };

  var remoteServiceDefinition2 = {
    serviceName: 'RemoteService2',
    methods: {
      bubbleSortTime: {
        asyncModel: 'requestResponse',
      },
    },
  };

  var remoteServiceDefinition3 = {
    serviceName: 'RemoteService3',
    methods: {
      bubbleSortTime: {
        asyncModel: 'requestResponse',
      },
    },
  };

  return {
    remoteServiceDefinition,
    remoteServiceDefinition2,
    remoteServiceDefinition3,
  };
})();
