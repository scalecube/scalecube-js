// @flow
import { Observable } from 'rxjs';
import { Transport as TransportInterface } from './api/Transport';
import { errors } from './errors';
import { TransportProvider } from './api/TransportProvider';
import { TransportProviderConfig, TransportRequest } from './api/types';

export class Transport implements TransportInterface {
  _provider: any;

  constructor() {
    this._provider = null;
    return this;
  }

  setProvider(Provider: Class<TransportProvider>, TransportProviderConfig: TransportProviderConfig): Promise<void> {
    const provider = new Provider();
    return provider.build(TransportProviderConfig).then(() => { this._provider = provider });
  }

  removeProvider(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this._provider) {
        return reject(new Error(errors.noProvider));
      }
      this._provider.destroy()
        .then(() => {
          this._provider = null;
          resolve();
        })
        .catch(reject);
    });
  }

  request(transportRequest: TransportRequest): Observable<any> {
    if (!this._provider) {
      return Observable.throw(new Error(errors.noProvider));
    }
    return this._provider.request(transportRequest);
  }

}


