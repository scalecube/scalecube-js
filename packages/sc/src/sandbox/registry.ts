import { Env, Service } from './sandbox';
import { concat, from, observable, Observable, Subject } from 'rxjs';
import { ServiceDefinition } from '@scalecube/api/lib/microservice';

export interface EnvEntry {
  type: 'Env';
  env: Env;
}
export interface ServiceEntry {
  type: 'Service';
  service: Service;
}
export type Entry = EnvEntry | ServiceEntry;

export interface RegistryAPI {
  register(req: Entry): Promise<void>;
  list$(req: {}): Observable<Entry>;
}
export const RegistryDefinition: ServiceDefinition = {
  serviceName: 'registry',
  methods: {
    register: {
      asyncModel: 'requestResponse',
    },
    list$: {
      asyncModel: 'requestStream',
    },
  },
};

export class Registry implements RegistryAPI {
  private entries: Entry[] = [];
  private entries$ = new Subject<Entry>();
  public async register(req: Entry): Promise<void> {
    console.log('register', req);
    this.entries.push(req);
    this.entries$.next(req);
  }
  public list$(req: {}): Observable<Entry> {
    console.log('list');
    return concat(from(this.entries), this.entries$);
  }
}
