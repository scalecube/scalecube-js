import { Single } from 'rsocket-flowable';
import { GatewayPluginType } from './api/Gateway';

const singleHandler: GatewayPluginType = (serviceCall, data, subscriber) => {
  subscriber.onSubscribe();
  serviceCall
    .requestResponse(data)
    .then((resp: any) => {
      // console.log('RESP', resp);
      subscriber.onComplete({ data: resp });
    })
    .catch((err: any) => {
      subscriber.onError(err);
    });
};

export const requestResponse = ({ data }, serviceCall, handler = singleHandler) => {
  return new Single(handler.bind(null, serviceCall, data));
};
