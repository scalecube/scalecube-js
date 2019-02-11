import { getServiceMeta } from '../helpers/serviceData';
import { map, mergeMap, tap } from 'rxjs6/operators';
import { from, iif, Observable, of } from 'rxjs6';
import { Message } from '../api/Message';

/**
 * Determine if service is lazy by his meta
 * @param service
 */
export const isAsyncLoader = (service): boolean => {
  const meta = getServiceMeta(service);
  return meta.isLazy || false;
};
/**
 * Continue to process the method base if the service is lazy or not
 * @param serviceInstance
 * @param method
 * @param msg
 */
export const processMethodBaseOnLaziness$ = ({ serviceInstance, method, msg }): Observable<Message> =>
  isAsyncLoader(serviceInstance)
    ? handleLazyService$({ method, msg, context: serviceInstance })
    : invokeMethod$({ method, msg, context: serviceInstance });
/**
 * Import the lazy service
 * @param method
 * @param context
 * @param msg
 */
export const handleLazyService$ = ({ method, context, msg }): Observable<Message> =>
  from(method()).pipe(
    mergeMap(
      (importedService: any): Observable<Message> =>
        invokeMethod$({ msg, method: importedService[msg.methodName], context })
    )
  );
/**
 * Invoke the method and convert the response to a Message interface
 * @param method
 * @param context
 * @param msg
 */
export const invokeMethod$ = ({ method, context, msg }): Observable<Message> =>
  from(method.call(context, msg.data)).pipe(
    map((response) => ({
      ...msg,
      data: response,
    }))
  );
/**
 * Use to enrich the data preRequest/postResponse
 * @param msg
 * @param enrichMethod
 */
export const enrichMsgData$ = ({ msg, enrichMethod }): Observable<Message> =>
  iif(() => typeof enrichMethod === 'function', of(msg).pipe(mergeMap((req) => enrichMethod(of(req)))), of(msg));
