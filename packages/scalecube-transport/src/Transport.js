// @flow
import { Observable } from 'rxjs';
import { Transport as TransportInterface } from './api/Transport';
import { errors } from './errors';
import { TransportClientProvider } from './api/TransportClientProvider';
import { TransportServerProvider } from './api/TransportServerProvider';
import { TransportProviderConfig, TransportRequest } from './api/types';

export class Transport implements TransportInterface {
  _clientProvider: any;
  _serverProvider: any;

  constructor() {
    this._clientProvider = null;
    this._serverProvider = null;
    return this;
  }

  setProvider(Provider: Class<TransportClientProvider | TransportServerProvider>, TransportProviderConfig: TransportProviderConfig): Promise<void> {
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
    return new Promise((resolve, reject) => {
      const destroyProvider = (providerName) => {
        this[providerName].destroy()
          .then(() => {
            this[providerName] = null;
            resolve();
          })
          .catch(reject);
      };
      if (!this._clientProvider && !this._serverProvider) {
        return reject(new Error(errors.noProvider));
      }
      if (this._clientProvider && this._serverProvider) {
        return Promise.all([this._clientProvider.destroy(), this._serverProvider.destroy()])
          .then(() => {
            this._clientProvider = null;
            this._serverProvider = null;
            resolve();
          })
          .catch(reject)
      } else if (this._clientProvider) {
        destroyProvider('_clientProvider');
      } else if (this._serverProvider) {
        destroyProvider('_serverProvider');
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
    if (!this._clientProvider) {
      throw new Error(errors.noProvider);
    }
    this._serverProvider.listen(path, callback);
    return this;
  }

}


