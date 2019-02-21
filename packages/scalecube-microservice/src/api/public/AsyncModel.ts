export type ObservableAsyncModel = 'Observable';

export type PromiseAsyncModel = 'Promise';

type AsyncModel = ObservableAsyncModel | PromiseAsyncModel;

export default AsyncModel;
