/**
 * Defines Stream asyncModel ( Observable, Flowable , etc.. )
 */
export type RequestStreamAsyncModel = 'requestStream';

/**
 * Defines Async asyncModel ( Promise )
 */
export type RequestResponseAsyncModel = 'requestResponse';

/**
 * Definition of the method's response type
 */
export type AsyncModel = RequestStreamAsyncModel | RequestResponseAsyncModel;
