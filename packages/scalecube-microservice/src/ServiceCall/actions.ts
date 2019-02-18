import { getServiceMeta } from '../helpers/serviceData';
import { catchError, map, mergeMap } from 'rxjs6/operators';
import { EMPTY, from, iif, Observable, of } from 'rxjs6';
import Message from '../api2/Message';
import ServiceCallResponse from '../api2/DispatcherResponse';

const loaders = {};

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
export const processMethodBaseOnLaziness$ = ({ service, method, msg }): Observable<Message> =>
  isAsyncLoader(service)
    ? handleLazyService$({ loader: method, msg, context: service })
    : invokeMethod$({ method, msg, context: service });
/**
 * Import the lazy service
 * @param method
 * @param context
 * @param msg
 */
export const handleLazyService$ = ({ loader, context, msg }): Observable<Message> =>
  from(loader()).pipe(
    catchError((err) => {
      console.warn(new Error(`dispatcher handleLazyService$ error: ${err}`));
      return EMPTY;
    }),
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
  of(method.call(context, ...msg.requestParams)).pipe(
    map((response: ServiceCallResponse) => ({
      ...msg,
      response,
    }))
  );
/**
 * Use to enrich the data preRequest/postResponse
 * @param msg
 * @param enrichMethod
 */
export const enrichMsgData$ = ({ msg, enrichMethod }): Observable<Message> =>
  iif(() => typeof enrichMethod === 'function', of(msg).pipe(mergeMap((msg) => enrichMethod(of(msg)))), of(msg));
