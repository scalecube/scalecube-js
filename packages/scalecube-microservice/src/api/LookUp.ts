import { Endpoint, LookupOptions } from '.';

/**
 * The function that provides all the appropriate endpoints for a given search criteria
 */
export type LookUp = (options: LookupOptions) => Endpoint[] | [];
