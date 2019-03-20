import { Endpoint, LookupOptions } from '.';

/**
 * The function that finds all the appropriate endpoints for a given criteria
 */
export type LookUp = (options: LookupOptions) => Endpoint[] | [];
