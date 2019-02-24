import { Observable } from 'rxjs6';
import { ServiceCall, CreateServiceCallOptions, ServiceCallResponse, ServiceCallOptions } from '../api/private/types';
import { asyncModelTypes, throwErrorFromServiceCall } from '../helpers/utils';
import { MESSAGE_NOT_PROVIDED } from '../helpers/constants';
import { localCall } from './LocalCall';
import { remoteCall } from './RemoteCall';

export const getServiceCall = ({ router, registry }: CreateServiceCallOptions): ServiceCall => {
  return ({ message, asyncModel, includeMessage }: ServiceCallOptions): ServiceCallResponse => {
    if (!message) {
      return throwErrorFromServiceCall({ asyncModel, errorMessage: MESSAGE_NOT_PROVIDED });
    }

    const localService = registry.lookUpLocal({ qualifier: message.qualifier });
    const res$: Observable<any> = localService
      ? localCall({ localService, asyncModel, includeMessage, message })
      : remoteCall({ router, registry, message, asyncModel });

    return asyncModel === asyncModelTypes.promise ? res$.toPromise() : res$;
  };
};
