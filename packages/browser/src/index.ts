import { MicroserviceApi } from '@scalecube/api';
import { createMicroservice as msCreate, ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
import { transport } from '@scalecube/transport-browser';
import { joinCluster } from '@scalecube/cluster-browser';
import { retryRouter } from '@scalecube/routers';
import { workers, getAddress as stringToAddress } from '@scalecube/utils';

export { ASYNC_MODEL_TYPES, workers, stringToAddress };

export const createMicroservice: MicroserviceApi.CreateMicroservice = (config: any) => {
  return msCreate({
    transport,
    cluster: joinCluster,
    defaultRouter: retryRouter({ period: 10, maxRetry: 500 }),
    ...config,
  });
};
