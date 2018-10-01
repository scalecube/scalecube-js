// @flow
import { Observable } from 'rxjs';
import { Transport as TransportInterface } from './api/Transport';
import { errors } from './errors';
import { TransportClientProvider } from './api/TransportClientProvider';
import { TransportProviderConfig, TransportRequest } from './api/types';

export class Transport implements TransportInterface {
  _clientProvider: any;
  _serverProvider: any;

  constructor() {
    this._clientProvider = null;
    this._serverProvider = null;
    return this;
  }

  setProvider(Provider: Class<TransportClientProvider>, TransportProviderConfig: TransportProviderConfig): Promise<void> {
    const provider = new Provider();
    return provider.build(TransportProviderConfig).then(() => {
      if (typeof provider.request === 'function') {
        this._clientProvider = provider;
      }
      if (typeof provider.listen === 'function') {
        this._serverProvider = provider;
      }
    });
  }

  removeProvider(): Promise<void> {
    // TODO should we remove both providers?
    return new Promise((resolve, reject) => {
      if (!this._clientProvider) {
        return reject(new Error(errors.noProvider));
      }
      this._clientProvider.destroy()
        .then(() => {
          this._clientProvider = null;
          !this._serverProvider && resolve();
        })
        .catch(reject);

      if (this._serverProvider) {
        this._serverProvider.destroy()
          .then(() => {
            this._serverProvider = null;
            resolve();
          })
          .catch(reject);
      }
    });
  }

  request(transportRequest: TransportRequest): Observable<any> {
    if (!this._clientProvider) {
      return Observable.throw(new Error(errors.noProvider));
    }
    return this._clientProvider.request(transportRequest);
  }

  listen(path, callback) {
    this._serverProvider.listen(path, callback);
    return this;
  }

}


