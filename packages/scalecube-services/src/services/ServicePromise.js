// @flow
import { ServiceRegistery } from '.';


export class ServicePromise<T> extends Promise<T> {
  meta: any;
  loader: (registery: ServiceRegistery)=> Promise<T>;
}
