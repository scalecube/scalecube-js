import { EMPTY } from 'rxjs6';
import { switchMap, map, catchError } from 'rxjs6/operators';

import { processMethodBaseOnLaziness$, enrichMsgData$ } from './actions';
import Message from '../api2/Message'
import DispatcherRequest from '../api2/DispatcherRequest'
import DispatcherResponse from '../api2/DispatcherResponse'

export const createDispatcher = ({ router, serviceRegistry, preRequest, postResponse }) => {
  console.log('creating dispatcher');
  return ({ message, type }: DispatcherRequest): DispatcherResponse => {
    if (!message) {
      throw Error('Error: data was not provided');
    }

    console.log('dispatcher call: message', message);
    console.log('dispatcher call: type', type);

    const routerInstance = router.route({ serviceRegistry, message });
    const { service } = routerInstance.service;
    const method = service[message.qualifier.methodName];

    const chain$ = enrichMsgData$({ msg: message, enrichMethod: preRequest }).pipe(
      catchError((err) => {
        console.warn(new Error(`dispatcher error: ${err}`));
        return EMPTY;
      }),
      switchMap((msg) => processMethodBaseOnLaziness$({ service, method, msg })),
      switchMap((msg) => enrichMsgData$({ msg, enrichMethod: postResponse })),
      map((msg: Message) => msg.data)
    );

    console.log('chain$ as a response of dispatcher', chain$);

    return type === 'Promise' ? chain$.toPromise() : chain$;
  };
};
