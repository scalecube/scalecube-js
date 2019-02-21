import { Observable, from } from 'rxjs6';
import { map } from 'rxjs6/operators';
import { ServiceCall, CreateServiceCallOptions, ServiceCallResponse, ServiceCallOptions } from '../api/private/types';
import { asyncModelTypes, throwErrorFromServiceCall } from '../helpers/utils';

export const createServiceCall = ({ router, serviceRegistry }: CreateServiceCallOptions): ServiceCall => {
  return ({ message, asyncModel, includeMessage }: ServiceCallOptions): ServiceCallResponse => {
    if (!message) {
      return throwErrorFromServiceCall({ asyncModel, errorMessage: 'Message has not been provided' });
    }

    const { qualifier } = message;
    const { methodPointer, methodName, context } = router.route({ serviceRegistry, qualifier });
    const method = methodPointer[methodName];
    const res$ = (from(method.apply(context, message.data)) as Observable<any>).pipe(
      map((response: any) => {
        if (includeMessage) {
          return {
            ...message,
            data: response,
          };
        }
        return response;
      })
    );

    return asyncModel === asyncModelTypes.promise ? res$.toPromise() : res$;
  };
};
