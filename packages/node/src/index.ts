import { MicroserviceApi } from '@scalecube/api';
import { createMicroservice as msCreate, ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
import { transport } from '@scalecube/transport-nodejs';
import { joinCluster } from '@scalecube/cluster-nodejs';
import { roundRobin } from '@scalecube/routers';
import { getAddress as stringToAddress } from '@scalecube/utils';

export { ASYNC_MODEL_TYPES, stringToAddress };

export const createMicroservice: MicroserviceApi.CreateMicroservice = (config: any) => {
  return msCreate({
    transport,
    cluster: joinCluster,
    defaultRouter: roundRobin,
    ...config,
  });
};
