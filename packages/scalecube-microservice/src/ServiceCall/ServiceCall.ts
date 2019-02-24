import { Observable, from, of } from 'rxjs6';
import { map } from 'rxjs6/operators';
import { ServiceCall, CreateServiceCallOptions, ServiceCallResponse, ServiceCallOptions } from '../api/private/types';
import { asyncModelTypes, throwErrorFromServiceCall } from '../helpers/utils';
import { Message } from '../api/public';

export const getServiceCall = ({ router, registry }: CreateServiceCallOptions): ServiceCall => {
  return ({ message, asyncModel, includeMessage }: ServiceCallOptions): ServiceCallResponse => {
    if (!message) {
      return throwErrorFromServiceCall({ asyncModel, errorMessage: 'Message has not been provided' });
    }

    let localService = registry.lookUpLocal({ qualifier: message.qualifier });
    let res$: Observable<any> = of({});

    // TODO check if the provider serviceDefinition === consumer serviceDefinition, if not equal then throw error

    if (localService && localService.reference) {
      const method = localService.reference[localService.methodName];

      res$ = invokeMethod({ method, message }).pipe(addMessageToResponse({ includeMessage, message }));
    } else {
      const endPoint = router.route({ registry, message });
      // TODO remote invoke
      // TODO if service is remote then use transport else invoke the function
    }

    return asyncModel === asyncModelTypes.promise ? res$.toPromise() : res$;
  };
};

export const invokeMethod = ({ method, message }: { method: (...args: any[]) => any; message: Message }) =>
  (from(method(message.data)) as Observable<any>).pipe();

export const addMessageToResponse = ({ includeMessage, message }: { includeMessage: boolean; message: Message }) =>
  map((response: any) => {
    if (includeMessage) {
      return {
        ...message,
        data: response,
      };
    }
    return response;
  });
