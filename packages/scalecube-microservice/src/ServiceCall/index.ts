import { EMPTY } from 'rxjs6';
import { switchMap, map, catchError } from 'rxjs6/operators';

import { processMethodBaseOnLaziness$, enrichMsgData$ } from './actions';
import Message from '../api2/Message';
import ServiceCallRequest from '../api2/ServiceCallRequest';
import ServiceCallResponse from '../api2/ServiceCallResponse';
import ServiceCall from '../api2/ServiceCall';

export const createServiceCall = ({ router, serviceRegistry, preRequest, postResponse }): ServiceCall => {
  return ({ message, type }: ServiceCallRequest): ServiceCallResponse => {
    if (!message) {
      throw Error('Error: data was not provided');
    }

    const routerInstance = router.route({ serviceRegistry, qualifier: message.qualifier });
    const { service } = routerInstance.service;
    const method = service[message.qualifier.methodName];

    const chain$ = enrichMsgData$({ msg: message, enrichMethod: preRequest }).pipe(
      catchError((err) => {
        console.warn(new Error(`dispatcher error: ${err}`));
        return EMPTY;
      }),
      switchMap((msg) => processMethodBaseOnLaziness$({ service, method, msg })),
      switchMap((msg) => enrichMsgData$({ msg, enrichMethod: postResponse })),
      map((msg: Message) => msg.response)
    );

    // We should extract method response from Observable without invoking this method response
    return type === 'Promise' ? chain$.toPromise() : chain$;
  };
};
