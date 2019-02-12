import { Message } from './Message';

export interface ServiceCallRequest {
  message: Message;
  type: 'Promise' | 'Observable';
}
