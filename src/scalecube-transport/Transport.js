import { Observable } from 'rxjs';
import { TransportInterface } from './api/TransportInterface';
import { errors } from './errors';

export class Transport implements TransportInterface {

  constructor() {
    this._provider = null;
  }

  setProvider(Provider, config) {
    const provider = new Provider();
    return provider.build(config).then(() => { this._provider = provider });
  }

  request(requestData) {
    if (!this._provider) {
      return Observable.throw(new Error(errors.noProvider));
    }
    return this._provider.request(requestData);
  }

}


