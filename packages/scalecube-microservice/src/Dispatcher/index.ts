import { EMPTY, from, iif, Observable, of } from 'rxjs6';
import { switchMap, tap, map, mergeMap, catchError } from 'rxjs6/operators';

import { ServiceCallRequest } from '../api/Dispatcher';
import { Message } from '../api/Message';
import { getServiceMeta } from '../helpers/serviceData';

export const createDispatcher = ({ router, serviceRegistry, getPreRequest$, postResponse$ }) => {
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

    const chain$ = enrichMsgDataPreRequest(message).pipe(
      catchError((err) => {
        console.warn(new Error(`dispatcher error: ${err}`));
        return EMPTY;
      }),
      switchMap((msg) =>
        isAsyncLoader(serviceInstance)
          ? from(method()).pipe(
              handleLazyService({
                msg,
                context: serviceInstance,
              })
            )
          : methodResponse$({ msg, method, context: serviceInstance })
      ),
      switchMap(enrichMsgDataPostResponse),
      map((msg: Message) => msg.data)
    );

    return type === 'Promise' ? chain$.toPromise() : chain$;
  };
};

const isAsyncLoader = (service): boolean => {
  const meta = getServiceMeta(service);
  return meta.isLazy || false;
};

const handleLazyService = ({ msg, context }): any =>
  mergeMap(
    (importedService: any): Observable<Message> =>
      methodResponse$({ msg, method: importedService[msg.methodName], context })
  );

const methodResponse$ = ({ msg, method, context }): Observable<Message> =>
  of(msg).pipe(invokeMethod({ method, context }));

const invokeMethod = ({ method, context }): any =>
  mergeMap((msg: Message) =>
    from(method.call(context, msg.data)).pipe(
      map((response) => ({
        ...msg,
        data: response,
      }))
    )
  );
