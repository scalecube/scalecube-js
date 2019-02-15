import Message from './Message';

export default interface DispatcherRequest {
  message: Message;
  type: 'Promise' | 'Observable';
}
