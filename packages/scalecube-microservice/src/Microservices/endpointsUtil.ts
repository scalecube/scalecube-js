/// This util is minimize and restore Endpoint[]
/// use for optimize endpoints transport
import { MicroserviceApi } from '@scalecube/api';
import { getAddress, getFullAddress } from '@scalecube/utils';

const eAsyncModel: { [key: number]: MicroserviceApi.AsyncModel } = {
  0: 'requestResponse',
  1: 'requestStream',
};
const sAsyncModel: { [key: string]: keyof typeof eAsyncModel } = {
  requestResponse: 0,
  requestStream: 1,
};

export interface Endpoints {
  [address: string]: {
    [serviceName: string]: {
      [methodName: string]: keyof typeof eAsyncModel;
    };
  };
}

export function minimized(endpoints: MicroserviceApi.Endpoint[]): Endpoints {
  const res: Endpoints = {};
  endpoints.forEach((e) => {
    res[getFullAddress(e.address)] = res[getFullAddress(e.address)] || {};
    res[getFullAddress(e.address)][e.serviceName] = res[getFullAddress(e.address)][e.serviceName] || {};
    res[getFullAddress(e.address)][e.serviceName][e.methodName] = sAsyncModel[e.asyncModel];
  });
  return res;
}

export function restore(endpoints: Endpoints): MicroserviceApi.Endpoint[] {
  const res: MicroserviceApi.Endpoint[] = [];
  for (const address in endpoints) {
    for (const service in endpoints[address]) {
      for (const method in endpoints[address][service]) {
        if (endpoints[address][service][method]) {
          res.push({
            asyncModel: eAsyncModel[endpoints[address][service][method]],
            methodName: method,
            serviceName: service,
            address: getAddress(address),
            qualifier: `${service}/${method}`,
          });
        }
      }
    }
  }
  return res;
}
