export var defaultRouter = Object.freeze({
  route: function(_a) {
    var message = _a.message,
      lookUp = _a.lookUp;
    var qualifier = message.qualifier;
    var endpoints = lookUp({ qualifier: qualifier });
    if (!(endpoints && Array.isArray(endpoints) && endpoints.length > 0)) {
      return null;
    } else {
      return endpoints[0];
    }
  },
});
