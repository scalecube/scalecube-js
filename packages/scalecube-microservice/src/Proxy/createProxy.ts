import { TransportApi, MicroserviceApi } from '@scalecube/api';
import { MicroserviceContext } from '../helpers/types';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { validateServiceDefinition } from '@scalecube/utils';
import { getProxy } from './Proxy';
import { getServiceCall } from '../ServiceCall/ServiceCall';
import { defaultRouter } from '@scalecube/routers';

export const createProxy = ({
  router,
  serviceDefinition,
  microserviceContext,
  transportClientProvider,
}: {
  router: MicroserviceApi.Router;
  serviceDefinition: MicroserviceApi.ServiceDefinition;
  microserviceContext: MicroserviceContext | null;
  transportClientProvider?: TransportApi.Provider;
}) => {
  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }
  validateServiceDefinition(serviceDefinition);

  return getProxy({
    serviceCall: getServiceCall({ router, microserviceContext, transportClientProvider }),
    serviceDefinition,
  });
};
