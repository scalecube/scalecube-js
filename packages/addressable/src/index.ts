import { bootstrap } from './boostrap';
import * as api from './api';

let win;
let worker;
// @ts-ignore
if (typeof window !== 'undefined') {
  // @ts-ignore
  win = window;
}
// @ts-ignore
if (typeof WorkerGlobalScope !== 'undefined') {
  // @ts-ignore
  worker = self;
}
const client = bootstrap(win, worker);

export const connect: api.connect = client.connect;
export const listen: api.listen = client.listen;
export type listener = api.Listener;
