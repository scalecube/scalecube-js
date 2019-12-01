'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@scalecube/utils');

var defaultRouter = function(options) {
  var message = options.message,
    lookUp = options.lookUp;
  var qualifier = message.qualifier;
  return new Promise(function(resolve, reject) {
    var endpoints = lookUp({ qualifier: qualifier });
    if (!(endpoints && Array.isArray(endpoints) && endpoints.length > 0)) {
      reject(null);
    } else {
      resolve(endpoints[0]);
    }
  });
};

var lastEndPointMap = {};
var roundRobin = function(options) {
  var message = options.message,
    lookUp = options.lookUp;
  var qualifier = message.qualifier;
  return new Promise(function(resolve, reject) {
    var endpoints = lookUp({ qualifier: qualifier });
    if (!(endpoints && Array.isArray(endpoints) && endpoints.length > 0)) {
      reject(null);
    } else {
      if (!lastEndPointMap[qualifier]) {
        lastEndPointMap[qualifier] = utils.getFullAddress(endpoints[0].address);
        resolve(endpoints[0]);
      } else {
        var lastEndPointIdentifier_1 = lastEndPointMap[qualifier];
        var lastIndex = endpoints.findIndex(function(endpoint) {
          return utils.getFullAddress(endpoint.address) === lastEndPointIdentifier_1;
        });
        if (lastIndex + 1 >= endpoints.length) {
          lastEndPointMap[qualifier] = utils.getFullAddress(endpoints[0].address);
          resolve(endpoints[0]);
        } else {
          lastEndPointMap[qualifier] = utils.getFullAddress(endpoints[lastIndex + 1].address);
          resolve(endpoints[lastIndex + 1]);
        }
      }
    }
  });
};

var retryRouter = function(_a) {
  var period = _a.period,
    maxRetry = _a.maxRetry;
  return function(options) {
    var message = options.message,
      lookUp = options.lookUp;
    var qualifier = message.qualifier;
    var retry = 0;
    return new Promise(function(resolve, reject) {
      var checkRegistry = function() {
        var endpoints = lookUp({ qualifier: qualifier });
        if (!(endpoints && Array.isArray(endpoints) && endpoints.length > 0)) {
          if (maxRetry && maxRetry >= retry) {
            retry++;
          }
          if (!maxRetry || maxRetry >= retry) {
            setTimeout(function() {
              checkRegistry();
            }, period);
          } else {
            reject(null);
          }
        } else {
          resolve(endpoints[0]);
        }
      };
      checkRegistry();
    });
  };
};

exports.defaultRouter = defaultRouter;
exports.retryRouter = retryRouter;
exports.roundRobin = roundRobin;
