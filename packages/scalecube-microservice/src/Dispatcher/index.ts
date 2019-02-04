import { Message } from '../api/Message';

export const createDispatcher = ({ router, serviceRegistry, preRequest$, postResponse$ }) => {
  const routerInstance = new router(serviceRegistry);

  return ({ message, type }: serviceCallRequest) => {};
};

interface serviceCallRequest {
  message: Message;
  type: 'Promise' | 'Obserable';
}
