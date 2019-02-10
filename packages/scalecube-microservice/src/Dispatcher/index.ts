import { EMPTY, from, iif, of } from 'rxjs6';
import { switchMap, tap, map, mergeMap, catchError } from 'rxjs6/operators';

import { ServiceCallRequest } from '../api/Dispatcher';
import { Message } from '../api/Message';

export const createDispatcher = ({ router, serviceRegistry, getPreRequest$, postResponse$ }) => {
  // TODO add ServiceCallResponse - serviceCall implementation
  return ({ message, type }: ServiceCallRequest) => {
    if (!message) {
      throw Error('Error: data was not provided');
    }

    const routerInstance = router.route({ serviceRegistry, request: message });
    const serviceInstance = routerInstance.service;
    const method = serviceInstance[message.methodName];

    const enrichMsgDataPreRequest = (msg: Message) =>
      iif(
        () => typeof getPreRequest$ === 'function',
        of(msg).pipe(mergeMap((req) => getPreRequest$(of(req)))),
        of(msg)
      );

    const enrichMsgDataPostResponse = (msg: Message) =>
      iif(() => typeof postResponse$ === 'function', of(msg).pipe(mergeMap((req) => postResponse$(of(req)))), of(msg));

    const invokeMethod = mergeMap((msg: Message) =>
      from(method(msg.data)).pipe(
        map((response) => ({
          ...msg,
          data: response,
        }))
      )
    );

    const isAsyncLoader = (service) => false; // TODO asyncService

    const chain$ = enrichMsgDataPreRequest(message).pipe(
      catchError((err) => {
        console.warn(new Error(`dispatcher error: ${err}`));
        return EMPTY;
      }),
      switchMap((msg) =>
        isAsyncLoader(routerInstance)
          ? from(new Promise((resolve) => method(msg.data).then((data) => resolve(data))))
          : of(msg).pipe(
              invokeMethod,
              mergeMap(enrichMsgDataPostResponse)
            )
      ),
      map((msg) => msg.data)
    );

    return type === 'Promise' ? chain$.toPromise() : chain$;
  };
};
