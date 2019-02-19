import { invokeMethod } from './actions';
import { ServiceCallOptions } from '../api2/private/types';

import ServiceCallRequest from '../api2/public/ServiceCallRequest';
import ServiceCallResponse from '../api2/public/ServiceCallResponse';
import ServiceCall from '../api2/public/ServiceCall';
import { getMethodName } from '../helpers/serviceData';

export const createServiceCall = ({ router, serviceRegistry }: ServiceCallOptions): ServiceCall => {
  return ({ message, asyncModel }: ServiceCallRequest): ServiceCallResponse => {
    if (!message) {
      throw Error('Error: data was not provided');
    }

    const { qualifier } = message;
    const { service } = router.route({ serviceRegistry, qualifier });
    const method = service[getMethodName({ qualifier })];
    const res$ = invokeMethod({ method, message, context: service });

    return asyncModel === 'Promise' ? res$.toPromise() : res$;
  };
};
