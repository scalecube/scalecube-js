// @flow
import { ServiceRegistery } from 'src/scalecube-services/services';


export class ServicePromise<T> extends Promise<T> {
  meta: any;
  loader: (registery: ServiceRegistery)=> Promise<T>;
}