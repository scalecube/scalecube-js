import DispatcherRequest from './DispatcherRequest';
import DispatcherResponse from './DispatcherResponse';

type Dispatcher = (dispatcherRequest: DispatcherRequest) => DispatcherResponse;

export default Dispatcher;
