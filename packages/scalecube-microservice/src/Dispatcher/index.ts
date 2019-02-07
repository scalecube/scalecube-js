import { ServiceCallRequest } from '../api/Dispatcher';
import { from, iif, of } from 'rxjs6';
import { switchMap, tap, map, mergeMap, catchError } from 'rxjs6/operators';

export const createDispatcher = ({ router, serviceRegistry, getPreRequest$, postResponse$ }) => {
  // TODO add ServiceCallResponse - serviceCall implementation
  return ({ message, type }: ServiceCallRequest) => {
    if (!message) {
      throw Error('Error: data was not provided');
    }

    const routerInstance = router.route({ serviceRegistry, request: message });
    const serviceInstance = routerInstance.service;
    const method = serviceInstance[message.methodName];

    const enrichMsgDataPreRequest = (msg) =>
      iif(
        () => typeof getPreRequest$ === 'function',
        of(msg).pipe(mergeMap((msg) => getPreRequest$(of(msg)))),
        of(msg)
      );

    const enrichMsgDataPostResponse = (msg) =>
      iif(() => typeof postResponse$ === 'function', of(msg).pipe(mergeMap((msg) => postResponse$(of(msg)))), of(msg));

    const isAsyncLoader = (service) => false; // TODO asyncService

    const chain$ = enrichMsgDataPreRequest(message).pipe(
      catchError((err) => {
        console.warn(new Error(`dispatcher error: ${err}`));
        return of({});
      }),
      switchMap((msg) =>
        isAsyncLoader(routerInstance)
          ? from(new Promise((resolve) => method(msg.data).then((data) => resolve(data))))
          : of(msg).pipe(
              mergeMap((msg) =>
                from(method(msg.data)).pipe(
                  map((response) => ({
                    response,
                    msg,
                  })),
                  map((data: any) => ({
                    ...data.msg,
                    data: data.response,
                  })),
                  mergeMap(enrichMsgDataPostResponse)
                )
              )
            )
      ),
      map((msg) => msg.data)
    );

    return type === 'Promise' ? chain$.toPromise() : chain$;
  };
};
