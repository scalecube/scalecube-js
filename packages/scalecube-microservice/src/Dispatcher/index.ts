import { ServiceCallRequest } from '../api/Dispatcher';

export const createDispatcher = ({ router, serviceRegistry, preRequest$, postResponse$ }) => {
  const routerInstance = new router(serviceRegistry);

  // TODO add ServiceCallResponse - serviceCall implementation
  return ({ message, type }: ServiceCallRequest) => {};
};
