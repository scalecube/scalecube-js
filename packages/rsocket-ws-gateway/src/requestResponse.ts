import { Single } from 'rsocket-flowable';
import { packError } from './utils';

export const requestResponse = (payload, serviceCall) => {
  const { data, metadata } = payload;
  // console.log('Request:', data, metadata);
  return new Single((subscriber) => {
    subscriber.onSubscribe();
    const message = JSON.parse(data);
    serviceCall
      .requestResponse(
        message
        // asyncModel: 'requestResponse',
        // includeMessage: true,
      )
      .then((resp: any) => {
        // console.log('RESP', resp);
        subscriber.onComplete({ data: JSON.stringify(resp) });
      })
      .catch((err: any) => {
        subscriber.onError(packError(err));
      });
  });
};
