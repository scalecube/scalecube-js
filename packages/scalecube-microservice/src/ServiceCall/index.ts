import { EMPTY } from 'rxjs6';
import { switchMap, map, catchError } from 'rxjs6/operators';

import { processMethodBaseOnLaziness$, enrichMsgData$ } from './actions';
import { ServiceCallOptions } from '../api2/types';

import Message from '../api2/Message';
import ServiceCallRequest from '../api2/ServiceCallRequest';
import ServiceCallResponse from '../api2/ServiceCallResponse';
import ServiceCall from '../api2/ServiceCall';
import { getMethodName } from '../helpers/serviceData';

export const createServiceCall = ({
  router,
  serviceRegistry,
  preRequest,
  postResponse,
}: ServiceCallOptions): ServiceCall => {
  return ({ message, type }: ServiceCallRequest): ServiceCallResponse => {
    if (!message) {
      throw Error('Error: data was not provided');
    }

    const { service } = router.route({ serviceRegistry, qualifier: message.qualifier! });
    const method = service[getMethodName(message.qualifier!)];

    const chain$ = enrichMsgData$({ msg: message, enrichMethod: preRequest }).pipe(
      catchError((err) => {
        console.warn(new Error(`dispatcher error: ${err}`));
        return EMPTY;
      }),
      switchMap((msg) => processMethodBaseOnLaziness$({ service, method, msg })),
      switchMap((msg) => enrichMsgData$({ msg, enrichMethod: postResponse })),
      map((msg: Message) => msg.data)
    );

    return type === 'Promise' ? chain$.toPromise() : chain$;
  };
};
