/**
 * Defines Observable in scalecube asyncModel
 */
export declare type RequestStreamAsyncModel = 'RequestStream';
/**
 * Defines Promise in scalecube asyncModel
 */
export declare type RequestResponseAsyncModel = 'RequestResponse';
/**
 * Type of communication between a consumer and a provider
 */
declare type AsyncModel = RequestStreamAsyncModel | RequestResponseAsyncModel;
export default AsyncModel;
