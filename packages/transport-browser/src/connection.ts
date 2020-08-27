import { connect, listen } from '@scalecube/addressable';
import { AsyncModel, ServiceCall } from '@scalecube/api/lib/microservice';
import { Observable } from 'rxjs';

export function createConnection() {
  const connections: { [address: string]: Promise<MessagePort> } = {};

  function getConnection(addr: string) {
    const address = addr + '/transport';
    connections[address] = connections[address] || connect(address);
    return connections[address];
  }
  function requestResponse(address: string, msg: any) {
    return new Promise(async (resolve, reject) => {
      const cid = Date.now() + Math.random();
      const con = await getConnection(address);
      con.postMessage({
        header: {
          cid,
          asyncModel: 'requestResponse' as AsyncModel,
        },
        msg,
      });

      const to = setTimeout(() => {
        con.removeEventListener('message', listener);
        reject('timeout');
      }, 5000);
      const listener = (ev: { data: any }) => {
        if (ev.data.header.cid === cid) {
          con.removeEventListener('message', listener);
          clearTimeout(to);
          if (ev.data.header.error) {
            reject(ev.data.header.error);
          }
          resolve(ev.data.msg);
        }
      };

      con.addEventListener('message', listener);
    });
  }
  function requestStream(address: string, msg: any) {
    return new Observable((obs) => {
      const cid = Date.now() + Math.random();
      getConnection(address).then((con) => {
        const to = setTimeout(() => {
          con.removeEventListener('message', listener);
          obs.error('timeout');
        }, 5000);
        const listener = (ev: { data: any }) => {
          if (ev.data.header.cid === cid) {
            switch (ev.data.header.type) {
              case 'NEXT':
                obs.next(ev.data.msg);
                break;
              case 'COMPLETE':
                con.removeEventListener('message', listener);
                obs.complete();
                break;
              case 'ERROR':
                con.removeEventListener('message', listener);
                obs.error(ev.data.header.error);
                break;
              case 'ACK':
                clearTimeout(to);
                break;
            }
          }
        };
        con.addEventListener('message', listener);
        con.postMessage({
          header: {
            cid,
            asyncModel: 'requestStream' as AsyncModel,
          },
          msg,
        });
      });
    });
  }
  function server(address: string, serviceCall: ServiceCall) {
    listen(address + '/transport', (msg, port) => {
      console.log(address);
      if (msg.data.header && msg.data.header.cid) {
        switch (msg.data.header.asyncModel as AsyncModel) {
          case 'requestResponse': {
            serviceCall
              .requestResponse(msg.data.msg)
              .then((res) =>
                port.postMessage({
                  header: {
                    cid: msg.data.header.cid,
                  },
                  msg: res,
                })
              )
              .catch((reason) =>
                port.postMessage({
                  header: {
                    cid: msg.data.header.cid,
                    error: reason,
                  },
                })
              );
            break;
          }
          case 'requestStream': {
            port.postMessage({
              header: {
                cid: msg.data.header.cid,
                type: 'ACK',
              },
            });
            serviceCall.requestStream(msg.data.msg).subscribe(
              (res) =>
                port.postMessage({
                  header: {
                    cid: msg.data.header.cid,
                    type: 'NEXT',
                  },
                  msg: res,
                }),
              (reason) =>
                port.postMessage({
                  header: {
                    cid: msg.data.header.cid,
                    error: reason,
                    type: 'ERROR',
                  },
                }),
              () =>
                port.postMessage({
                  header: {
                    cid: msg.data.header.cid,
                    type: 'COMPLETE',
                  },
                })
            );
            break;
          }
        }
      }
    });
  }

  return { requestResponse, requestStream, server };
}
