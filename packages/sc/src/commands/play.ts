import { client } from '../sandbox/client';
import { bootstrap } from '../sandbox/bootstrap';

export function play() {
  client(8999);
  bootstrap({ address: 'ws://127.0.0.1:8997/', gateway: 8998 });
}
