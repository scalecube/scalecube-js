import ServiceCallRequest from './ServiceCallRequest';
import ServiceCallResponse from './ServiceCallResponse';

type ServiceCall = (serviceCallRequest: ServiceCallRequest) => ServiceCallResponse;

export default ServiceCall;
