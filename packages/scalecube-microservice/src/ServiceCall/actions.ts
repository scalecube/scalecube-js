import { map } from 'rxjs6/operators';
import { from, Observable } from 'rxjs6';
import { Message } from '../api2/public';
import { InvokeMethodOptions } from '../api2/private/types';

/**
 * Invoke the method and convert the response to a Message interface
 * @param method
 * @param context
 * @param msg
 */
export const invokeMethod = ({ method, message, context }: InvokeMethodOptions): Observable<Message> =>
  from(method.apply(context, message.data)).pipe(
    map((response: any) => ({
      ...message,
      data: response,
    }))
  );
