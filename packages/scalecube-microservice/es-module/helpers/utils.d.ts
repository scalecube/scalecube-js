/// <reference types="node" />
import { AsyncModel } from '../api';
export declare const isObject: (obj: object) => boolean;
export declare const isFunction: (obj: object) => boolean;
export declare const throwErrorFromServiceCall: ({
  asyncModel,
  errorMessage,
}: {
  asyncModel: AsyncModel;
  errorMessage: string;
}) => import('rxjs').Observable<never> | Promise<never>;
export declare const getGlobalNamespace: () => Window | NodeJS.Global;
