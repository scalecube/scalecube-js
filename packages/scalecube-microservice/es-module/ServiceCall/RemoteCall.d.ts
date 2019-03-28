import { Observable } from 'rxjs';
import { RemoteCallOptions } from '../helpers/types';
export declare const remoteCall: ({
  router,
  microserviceContext,
  message,
  asyncModel,
}: RemoteCallOptions) => Observable<any>;
