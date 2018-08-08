// @flow
import RSocketWebSocketClient from 'rsocket-websocket-client';
import WS from 'isomorphic-ws';
import { JsonSerializers, RSocketClient } from 'rsocket-core';
import { Observable, Subject } from 'rxjs';
import { validateRequest, extractConnectionError, validateBuildConfig } from '../utils';
import { ProviderInterface } from '../api/ProviderInterface';
import { ProviderConfig, TransportRequest } from '../api/types';

export class PostMessageProvider implements ProviderInterface {
  _worker: any;
  _subjects: any;
  _handleNewMessage: any;

  constructor() {
    this._worker = null;
    this._subjects = {};
    this._handleNewMessage = this._handleNewMessage.bind(this);
    return this;
  }

  build(config: ProviderConfig): Promise<void> {
    let { URI } = config;
    this._worker = window.workers[URI];
    this._worker.addEventListener('message', this._handleNewMessage);
    return Promise.resolve();
  }

  request(requestData: TransportRequest): Observable<any> {
    const { headers: { requestId, responsesLimit }, data, entrypoint } = requestData;
    this._subjects[requestId] = new Subject();
    this._worker.postMessage({ entrypoint, data, requestId });

    return Observable.create((subscriber) => {
      this._subjects[requestId].subscribe(
        data => subscriber.next(data),
        error => {},
        () => subscriber.complete()
      );
    });
  }

  _handleNewMessage({ data }) {
    const subject = this._subjects[data.requestId];
    if (!data.completed) {
      subject.next(data.data);
    } else {
      subject.complete();
    }
  }

  destroy(): Promise<void> {
    this._worker.removeEventListener('message', this._handleNewMessage);
    this._worker = null;
    this._subjects = {};
    return Promise.resolve();
  }

}


