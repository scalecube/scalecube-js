import { MicroserviceApi } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';

const lastEndPointMap: { [qualifier: string]: string } = {};

export const roundRobin: MicroserviceApi.Router = (options: MicroserviceApi.RouterOptions) => {
  const { message, lookUp } = options;
  const { qualifier } = message;

  return new Promise((resolve, reject) => {
    const endpoints = lookUp({ qualifier });
    if (!(endpoints && Array.isArray(endpoints) && endpoints.length > 0)) {
      reject(null);
    } else {
      if (!lastEndPointMap[qualifier]) {
        lastEndPointMap[qualifier] = getFullAddress(endpoints[0].address);
        resolve(endpoints[0]);
      } else {
        const lastEndPointIdentifier = lastEndPointMap[qualifier];

        const lastIndex = endpoints.findIndex((endpoint: MicroserviceApi.Endpoint) => {
          return getFullAddress(endpoint.address) === lastEndPointIdentifier;
        });

        if (lastIndex + 1 >= endpoints.length) {
          lastEndPointMap[qualifier] = getFullAddress(endpoints[0].address);
          resolve(endpoints[0]);
        } else {
          lastEndPointMap[qualifier] = getFullAddress(endpoints[lastIndex + 1].address);
          resolve(endpoints[lastIndex + 1]);
        }
      }
    }
  });
};
