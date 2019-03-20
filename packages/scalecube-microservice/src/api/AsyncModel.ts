/**
 * Defines Observable in scalecube asyncModel
 */
export type RequestStreamAsyncModel = 'RequestStream';

/**
 * Defines Promise in scalecube asyncModel
 */
export type RequestResponseAsyncModel = 'RequestResponse';

/**
 * Type of communication between a consumer and a provider
 */
type AsyncModel = RequestStreamAsyncModel | RequestResponseAsyncModel;

export default AsyncModel;
