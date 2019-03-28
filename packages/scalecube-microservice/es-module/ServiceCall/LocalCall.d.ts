import { Observable } from 'rxjs';
import { AddMessageToResponseOptions, InvokeMethodOptions, LocalCallOptions } from '../helpers/types';
export declare const localCall: ({
  localService,
  asyncModel,
  includeMessage,
  message,
}: LocalCallOptions) => Observable<any>;
export declare const invokeMethod: ({ method, message }: InvokeMethodOptions) => Observable<{}>;
export declare const addMessageToResponse: ({
  includeMessage,
  message,
}: AddMessageToResponseOptions) => import('rxjs').OperatorFunction<any, any>;
