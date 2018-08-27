// @flow
import { eventTypes } from './helpers/const';
import { createId } from './helpers/utils';

export class ClusterTransport {
  config;

  constructor(transportConfig, messages$) {
    this.config = transportConfig;
    this.messages$ = messages$;
    this.config.me.on(eventTypes.message, ({ data }) => {
      if (data.clusterId === this.config.clusterId) {
        this.messages$.next(data.message);
      }
    });
  }

  _getMsg(correlationId) {
    return new Promise((resolve) => {
      const handleResponse = ({ data }) => {
        if (data.correlationId === correlationId && data.clusterId === this.config.clusterId && !!data.response) {
          this.config.me.removeListener(eventTypes.requestResponse, handleResponse);
          resolve(data.response);
        }
      };
      this.config.me.on(eventTypes.requestResponse, handleResponse);
    });
  }

  invoke(path, args) {
    const correlationId = createId();
    this.config.worker.postMessage({
      eventType: eventTypes.requestResponse,
      correlationId,
      clusterId: this.config.clusterId,
      request: { path, args }
    });

    return this._getMsg(correlationId);
  }
}
