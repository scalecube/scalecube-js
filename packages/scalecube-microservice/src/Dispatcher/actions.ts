import { getServiceMeta } from '../helpers/serviceData';
import { map, mergeMap, tap } from 'rxjs6/operators';
import { from, iif, Observable, of } from 'rxjs6';
import { Message } from '../api/Message';

export const isAsyncLoader = (service): boolean => {
  const meta = getServiceMeta(service);
  return meta.isLazy || false;
};

export const processMethodBaseOnLaziness$ = ({ serviceInstance, method, msg }): Observable<Message> =>
  isAsyncLoader(serviceInstance)
    ? handleLazyService$({ method, msg, context: serviceInstance })
    : invokeMethod$({ method, msg, context: serviceInstance });

export const handleLazyService$ = ({ method, context, msg }): Observable<Message> =>
  from(method()).pipe(
    mergeMap(
      (importedService: any): Observable<Message> =>
        invokeMethod$({ msg, method: importedService[msg.methodName], context })
    )
  );

export const invokeMethod$ = ({ method, context, msg }): Observable<Message> =>
  from(method.call(context, msg.data)).pipe(
    map((response) => ({
      ...msg,
      data: response,
    }))
  );

export const enrichMsgDataPreRequest$ = ({ msg, getPreRequest$ }): Observable<Message> =>
  iif(() => typeof getPreRequest$ === 'function', of(msg).pipe(mergeMap((req) => getPreRequest$(of(req)))), of(msg));

export const enrichMsgDataPostResponse$ = ({ msg, postResponse$ }): Observable<Message> =>
  iif(() => typeof postResponse$ === 'function', of(msg).pipe(mergeMap((req) => postResponse$(of(req)))), of(msg));
