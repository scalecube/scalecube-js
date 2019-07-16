import { Observable } from 'rxjs';
import { ServiceCall, CreateServiceCallOptions, ServiceCallResponse, ServiceCallOptions } from '../helpers/types';
import { throwErrorFromServiceCall } from '../helpers/utils';
import { validateMessage } from '../helpers/validation';
import { ASYNC_MODEL_TYPES } from '..';
import { localCall } from './LocalCall';
import { remoteCall } from './RemoteCall';
import { take } from 'rxjs/operators';

export const getServiceCall = ({
  router,
  microserviceContext,
  transportClientProvider,
  connectionManager,
}: CreateServiceCallOptions): ServiceCall => {
  return ({ message, asyncModel, messageFormat }: ServiceCallOptions): ServiceCallResponse => {
    try {
      validateMessage(message);
    } catch (e) {
      return throwErrorFromServiceCall({ asyncModel, errorMessage: e.message });
    }

    const localService = microserviceContext.localRegistry.lookUp({ qualifier: message.qualifier });
    const res$: Observable<any> = localService
      ? localCall({ localService, asyncModel, messageFormat, message })
      : remoteCall({ router, microserviceContext, message, asyncModel, transportClientProvider, connectionManager });

    return asyncModel === ASYNC_MODEL_TYPES.REQUEST_RESPONSE ? res$.pipe(take(1)).toPromise() : res$;
  };
};
