import { CreateProxy } from '../helpers/types';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { validateServiceDefinition } from '@scalecube/utils';
import { getProxy } from './Proxy';
import { getServiceCall } from '../ServiceCall/ServiceCall';

export const createProxy = (proxyOptions: CreateProxy) => {
  const { router, serviceDefinition, microserviceContext, transportClient } = proxyOptions;

  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }
  validateServiceDefinition(serviceDefinition);

  return getProxy({
    serviceCall: getServiceCall({ router, microserviceContext, transportClient }),
    serviceDefinition,
  });
};
