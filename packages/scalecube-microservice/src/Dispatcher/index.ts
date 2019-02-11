import { EMPTY } from 'rxjs6';
import { switchMap, map, catchError } from 'rxjs6/operators';

import { ServiceCallRequest } from '../api/Dispatcher';
import { Message } from '../api/Message';
import { enrichMsgDataPostResponse$, enrichMsgDataPreRequest$, processMethodBaseOnLaziness$ } from './actions';

export const createDispatcher = ({ router, serviceRegistry, getPreRequest$, postResponse$ }) => {
  return ({ message, type }: ServiceCallRequest) => {
    if (!message) {
      throw Error('Error: data was not provided');
    }

    const routerInstance = router.route({ serviceRegistry, request: message });
    const serviceInstance = routerInstance.service;
    const method = serviceInstance[message.methodName];

    const chain$ = enrichMsgDataPreRequest$({ msg: message, getPreRequest$ }).pipe(
      catchError((err) => {
        console.warn(new Error(`dispatcher error: ${err}`));
        return EMPTY;
      }),
      switchMap((msg) => processMethodBaseOnLaziness$({ serviceInstance, method, msg })),
      switchMap((msg) => enrichMsgDataPostResponse$({ msg, postResponse$ })),
      map((msg: Message) => msg.data)
    );

    return type === 'Promise' ? chain$.toPromise() : chain$;
  };
};
