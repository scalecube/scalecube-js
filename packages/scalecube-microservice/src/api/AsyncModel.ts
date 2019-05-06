/**
 * Defines Observable in scalecube asyncModel
 */
export type RequestStreamAsyncModel = 'requestStream';

/**
 * Defines Promise in scalecube asyncModel
 */
export type RequestResponseAsyncModel = 'requestResponse';

/**
 * Type of communication between a consumer and a provider
 */
type AsyncModel = RequestStreamAsyncModel | RequestResponseAsyncModel;

export default AsyncModel;
