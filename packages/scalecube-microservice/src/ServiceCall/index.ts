import { invokeMethod } from './actions';
import { ServiceCallOptions } from '../api2/private/types';
import { ServiceCall, ServiceCallRequest, ServiceCallResponse } from '../api2/public';

export const createServiceCall = ({ router, serviceRegistry }: ServiceCallOptions): ServiceCall => {
  return ({ message, asyncModel }: ServiceCallRequest): ServiceCallResponse => {
    if (!message) {
      throw Error('Error: data was not provided');
    }

    const { qualifier } = message;
    const { methodPointer, methodName, context } = router.route({ serviceRegistry, qualifier });
    const method = methodPointer[methodName];
    const res$ = invokeMethod({ method, message, context });

    return asyncModel === 'Promise' ? res$.toPromise() : res$;
  };
};
