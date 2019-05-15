/**
 * Defines Stream asyncModel ( Observable, Flowable , etc.. )
 */
export type RequestStreamAsyncModel = 'requestStream';

/**
 * Defines Async asyncModel ( Promise )
 */
export type RequestResponseAsyncModel = 'requestResponse';

/**
 * Property that defines the response type of the method.
 */
type AsyncModel = RequestStreamAsyncModel | RequestResponseAsyncModel;

export default AsyncModel;
