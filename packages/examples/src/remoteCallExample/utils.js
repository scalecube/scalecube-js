var utils = (function() {
  var generateAddress = (port) => ({
    host: 'defaultHostName',
    port,
    path: 'defaultPathName',
    protocol: 'pm',
    fullAddress: `pm://defaultHostName:${port}/path`,
  });

  return {
    generateAddress,
  };
})();
