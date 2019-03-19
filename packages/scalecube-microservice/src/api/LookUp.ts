import { Endpoint, LookupOptions } from '.';

export type LookUp = (options: LookupOptions) => Endpoint[] | [];
