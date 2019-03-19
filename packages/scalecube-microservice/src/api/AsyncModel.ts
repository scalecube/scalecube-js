/**
 * "Request Stream" type of async model - a consumer requires a stream and receives the emits from a provider after
 * the subscription
 */
export type RequestStreamAsyncModel = 'RequestStream';

/**
 * "Request Response" type of async model - a consumer requires data and a provider responds with the data once
 */
export type RequestResponseAsyncModel = 'RequestResponse';

/**
 * Type of communication between a consumer and a provider
 */
type AsyncModel = RequestStreamAsyncModel | RequestResponseAsyncModel;

export default AsyncModel;
