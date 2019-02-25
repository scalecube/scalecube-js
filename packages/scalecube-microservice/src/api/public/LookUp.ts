import { Endpoint, LookupOptions } from './index';

export type LookUp = (options: LookupOptions) => Endpoint[] | any;
