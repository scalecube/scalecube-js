import { Endpoint, RouterApi } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';

const lastEndPointMap: { [qualifier: string]: string } = {};

export const roundRobin: RouterApi.Router = (options) => {
  const { message, lookUp } = options;
  const { qualifier } = message;

  const endpoints = lookUp({ qualifier });
  if (!(endpoints && Array.isArray(endpoints) && endpoints.length > 0)) {
    return null;
  } else {
    if (!lastEndPointMap[qualifier]) {
      lastEndPointMap[qualifier] = getFullAddress(endpoints[0].address);
      return endpoints[0];
    } else {
      const lastEndPointIdentifier = lastEndPointMap[qualifier];
      const lastIndex = endpoints.findIndex((endpoint: Endpoint) => {
        return getFullAddress(endpoint.address) === lastEndPointIdentifier;
      });

      if (lastIndex + 1 >= endpoints.length) {
        lastEndPointMap[qualifier] = getFullAddress(endpoints[0].address);
        return endpoints[0];
      } else {
        lastEndPointMap[qualifier] = getFullAddress(endpoints[lastIndex + 1].address);
        return endpoints[lastIndex + 1];
      }
    }
  }
};
