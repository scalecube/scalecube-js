export type ObservableAsyncModel = 'Observable';

export type PromiseAsyncModel = 'Promise';
// change to 4 way of communication (requestResponse, ...)
type AsyncModel = ObservableAsyncModel | PromiseAsyncModel;

export default AsyncModel;
