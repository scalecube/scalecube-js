import { Observable, from } from 'rxjs6';
import { ServiceCallOptions } from '../api2/private/types';
import { ServiceCall, ServiceCallRequest, ServiceCallResponse } from '../api2/public';
import { throwErrorFromServiceCall } from '../helpers/utils';

export const createServiceCall = ({ router, serviceRegistry }: ServiceCallOptions): ServiceCall => {
  return ({ message, asyncModel }: ServiceCallRequest): ServiceCallResponse => {
    if (!message) {
      return throwErrorFromServiceCall({ asyncModel, errorMessage: 'Message has not been provided' });
    }

    const { qualifier } = message;
    const { methodPointer, methodName, context } = router.route({ serviceRegistry, qualifier });
    const method = methodPointer[methodName];
    const res$ = from(method.apply(context, message.data)) as Observable<any>;

    return asyncModel === 'Promise' ? res$.toPromise() : res$;
  };
};
