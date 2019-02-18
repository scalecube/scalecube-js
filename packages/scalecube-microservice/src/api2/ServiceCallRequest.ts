import Message from './Message';
import AsyncModel from './AsyncModel';

export default interface ServiceCallRequest {
  message: Message;
  type: AsyncModel;
}
