// @flow
import { Observable } from 'rxjs';
import { TransportInterface } from './api/TransportInterface';
import { errors } from './errors';
import { ProviderInterface } from './api/ProviderInterface';
import { ProviderConfig, TransportRequest } from './api/types';

export class Transport implements TransportInterface {
  _provider: any;

  constructor() {
    this._provider = null;
  }

  setProvider(Provider: ProviderInterface, providerConfig: ProviderConfig): Promise<void> {
    // $FlowFixMe
    const provider = new Provider();
    return provider.build(providerConfig).then(() => { this._provider = provider });
  }

  removeProvider(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this._provider) {
        return reject(new Error(errors.noProvider));
      }
      return this._provider.destroy()
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


