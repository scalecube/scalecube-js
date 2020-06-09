import { MicroserviceApi } from '@scalecube/api';
import { createMicroservice, ASYNC_MODEL_TYPES } from '../../src';
import { transport } from '@scalecube/transport-browser';
import { joinCluster } from '@scalecube/cluster-browser';
import { retryRouter } from '@scalecube/routers';

export { ASYNC_MODEL_TYPES };

export const createMS: MicroserviceApi.CreateMicroservice = (config) => {
  return createMicroservice({
    // @ts-ignore
    transport,
    cluster: joinCluster,
    defaultRouter: retryRouter({ period: 10, maxRetry: 50 }),
    ...config,
  });
};

export const createMSNoRouter: MicroserviceApi.CreateMicroservice = (config) => {
  return createMicroservice({
    // @ts-ignore
    transport,
    cluster: joinCluster,
    ...config,
  });
};
