// @flow
import { Subject } from 'rxjs/Subject';
import { eventTypes } from './helpers/const';
import { createId } from './helpers/utils';
import { Request } from './api/types';
import { TransportConfig } from './api/TransportConfig';
import { Transport as TransportInterface } from './api/Transport';

export class ClusterTransport implements TransportInterface {
  config: TransportConfig;

  constructor(transportConfig: TransportConfig, messages$: Subject) {
    this.config = transportConfig;
    this.messages$ = messages$;
    this.config.me.on(eventTypes.message, ({ data }) => {
      if (data.clusterId === this.config.clusterId) {
        this.messages$.next(data.message);
      }
    });
  }

  _getMsg(correlationId: string): Promise<any> {
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

  invoke(request: Request): Promise<any> {
    const correlationId = createId();
    this.config.worker.postMessage({
      eventType: eventTypes.requestResponse,
      correlationId,
      clusterId: this.config.clusterId,
      request
    });

    return this._getMsg(correlationId);
  }
}
