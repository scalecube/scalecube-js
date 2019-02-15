import DispatcherResponse from './DispatcherResponse';
import Qualifier from './Qualifier';

export default interface Message {
  qualifier: Qualifier;
  requestParams: any[];
  response?: DispatcherResponse;
}
