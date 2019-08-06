import { Flowable } from 'rsocket-flowable';
import { GatewayPluginType } from './api/Gateway';

const flowableHandler: GatewayPluginType = (serviceCall, data, subscriber) => {
  subscriber.onSubscribe();
  serviceCall.requestStream(data).subscribe(
    (response: any) => {
      subscriber.onNext({ data: response });
    },
    (error: any) => subscriber.onError(error),
    () => subscriber.onComplete()
  );
};

export const requestStream = ({ data }, serviceCall, handler = flowableHandler) => {
  return new Flowable(handler.bind(null, serviceCall, data));
};
