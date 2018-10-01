import { Observable } from 'rxjs';
import 'rxjs/add/observable/of';
import {Transport} from "../src/Transport";
import {RSocketProvider} from "../src/provider/RSocketProvider";
import {RSocketServerProvider} from "../src/provider/RSocketServerProvider";
import {socketURI} from "./utils";


describe('Transport server test suite', () => {
  it('Listen for "pojo/one" send response and the stream is completed', async (done) => {
    const transport = new Transport();
    await transport.setProvider(RSocketServerProvider, {});
    await transport.setProvider(RSocketProvider, { URI: socketURI });

    transport.listen('/greeting/one', (request) => {
      return Observable.of(`From callback: ${request}`);
    });

    const stream = transport.request({ headers: { type: 'requestResponse' }, data: 'test', entrypoint: '/greeting/one' });

    stream.subscribe(data => {
      console.log('final data', data);
    });

    setTimeout(() => {
      done();
    }, 2000)
  });
});
