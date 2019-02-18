import { Observable } from 'rxjs6';

type ServiceCallResponse = Observable<any> | Promise<any>;
export default ServiceCallResponse;
