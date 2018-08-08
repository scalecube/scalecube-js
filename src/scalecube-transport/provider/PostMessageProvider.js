// @flow
import { JsonSerializers, RSocketClient } from 'rsocket-core';
import { Observable, Subject } from 'rxjs';
import { validateRequest, validateBuildConfig } from '../utils';
import { ProviderInterface } from '../api/ProviderInterface';
import { ProviderConfig, TransportRequest } from '../api/types';
import { errors } from '../errors';

export class PostMessageProvider implements ProviderInterface {
  _worker: any;
  _subscribers: any;
  _handleNewMessage: any;

  constructor() {
    this._worker = null;
    this._subscribers = {};
    this._handleNewMessage = this._handleNewMessage.bind(this);
    return this;
  }

  build(config: ProviderConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const { URI } = config;
      const validationError = validateBuildConfig({ URI });
      if (validationError) {
        return reject(new Error(validationError));
      }
      this._worker = window.workers[URI];
      if (typeof (this._worker || {}).postMessage !== 'function') {
        return reject(new Error(errors.urlNotFound))
      }
      this._worker.addEventListener('message', this._handleNewMessage);
      resolve();
    });
  }

  request(requestData: TransportRequest): Observable<any> {
    let updates = 0;
    return Observable.create((subscriber) => {
      const validationError = validateRequest(requestData, { type: true });
      if (validationError) {
        subscriber.error(new Error(validationError));
      } else {
        const requestId = Date.now();
        const { headers, data, entrypoint } = requestData;
        const { responsesLimit } = headers || {};
        this._subscribers[requestId] = new Subject();
        this._worker.postMessage({ entrypoint, data, requestId });
        this._subscribers[requestId].subscribe(
          (data) => {
            updates++;
            if (!responsesLimit || updates <= responsesLimit) {
              subscriber.next(data);
            }
          },
          error => subscriber.error(error),
          subscriber.complete
        );
      }

      return () => { console.log('unsubscribe'); }
    });
  }

  _handleNewMessage({ data }) {
    const subscriber = this._subscribers[data.requestId];
    if (!subscriber) {
      return;
    }
    if (!data.completed) {
      subscriber.next(data.data);
    } else {
      delete this._subscribers[data.requestId];
      subscriber.complete();
    }
  }

  destroy(): Promise<void> {
    return new Promise((resolve) => {
      Object.values(this._subscribers)
        .forEach((subscriber: any) => subscriber.error(new Error(errors.closedConnection)));
      this._subscribers = {};
      this._worker = null;
      resolve();
    });
  }

}


