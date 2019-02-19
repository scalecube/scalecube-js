import { ServiceCallData, AsyncModel, Message } from '.';

export default interface ServiceCallRequest {
  message: Message;
  type: AsyncModel;
  serviceCallData: ServiceCallData;
}
