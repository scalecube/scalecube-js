import { AsyncModel, Message } from '../public';

export default interface ServiceCallRequest {
  message: Message;
  asyncModel: AsyncModel;
}
