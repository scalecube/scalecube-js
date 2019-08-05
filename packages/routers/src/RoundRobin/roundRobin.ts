import { Endpoint, RouterApi } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';

export const roundRobin: RouterApi.Router = (options) => {
  const { message, lookUp } = options;
  const { qualifier } = message;
  let lastEndPointIdentifier: any;

  const endpoints = lookUp({ qualifier });
  if (!(endpoints && Array.isArray(endpoints) && endpoints.length > 0)) {
    return null;
  } else {
    if (!lastEndPointIdentifier) {
      lastEndPointIdentifier = getFullAddress(endpoints[0].address);
      return endpoints[0];
    } else {
      const lastIndex = endpoints.findIndex((endpoint: Endpoint) => {
        return getFullAddress(endpoint.address) === lastEndPointIdentifier;
      });

      if (lastIndex + 1 > endpoints.length) {
        lastEndPointIdentifier = getFullAddress(endpoints[0].address);
        return endpoints[0];
      } else {
        lastEndPointIdentifier = getFullAddress(endpoints[lastIndex + 1].address);
        return endpoints[lastIndex + 1];
      }
    }
  }
};
