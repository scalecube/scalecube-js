// @flow
import { Observable } from 'rxjs';
import { TransportInterface } from './api/TransportInterface';
import { errors } from './errors';
import { ProviderInterface } from './api/ProviderInterface';
import {ProviderConfig, TransportRequest} from './api/types';

export class Transport implements TransportInterface {
  _provider: any;

  constructor() {
    this._provider = null;
  }

  setProvider(Provider: ProviderInterface, providerConfig: ProviderConfig) {
    const provider = new Provider();
    return provider.build(providerConfig).then(() => { this._provider = provider });
  }

  request(transportRequest: TransportRequest) {
    if (!this._provider) {
      return Observable.throw(new Error(errors.noProvider));
    }
    return this._provider.request(transportRequest);
  }

}


