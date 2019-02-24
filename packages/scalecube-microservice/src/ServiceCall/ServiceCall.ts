import { Observable, from, of } from 'rxjs6';
import { map } from 'rxjs6/operators';
import { ServiceCall, CreateServiceCallOptions, ServiceCallResponse, ServiceCallOptions } from '../api/private/types';
import { asyncModelTypes, throwErrorFromServiceCall } from '../helpers/utils';
import { Message } from '../api/public';
import { MESSAGE_NOT_PROVIDED } from '../helpers/constants';
import AsyncModel from '../api/public/AsyncModel';
import { localCall } from './LocalCall';
import { remoteCall } from './RemoteCall';

export const getServiceCall = ({ router, registry }: CreateServiceCallOptions): ServiceCall => {
  return ({ message, asyncModel, includeMessage }: ServiceCallOptions): ServiceCallResponse => {
    if (!message) {
      return throwErrorFromServiceCall({ asyncModel, errorMessage: MESSAGE_NOT_PROVIDED });
    }

    let localService = registry.lookUpLocal({ qualifier: message.qualifier });
    let res$: Observable<any> = localService
      ? of(localCall({ localService, asyncModel, includeMessage, message }))
      : of(remoteCall({ router, registry, message, asyncModel }));

    return asyncModel === asyncModelTypes.promise ? res$.toPromise() : res$;
  };
};
