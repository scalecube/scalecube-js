import { connect, listen } from '@scalecube/addressable';
import { AsyncModel, ServiceCall } from '@scalecube/api/lib/microservice';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

export function createClient() {
  const connections: { [address: string]: Promise<MessagePort> } = {};
  const shutdown$ = new Subject();

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
      let cancel: any;
      getConnection(address).then((con) => {
        if (cancel === true) {
          return;
        }
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
        const sub = shutdown$.subscribe((addr) => {
          if (addr === address) {
            obs.error('Transport client shutdown');
            con.postMessage({
              header: {
                cid,
                asyncModel: 'requestStream' as AsyncModel,
                type: 'UNSUBSCRIBE',
              },
            });
            con.removeEventListener('message', listener);
            clearTimeout(to);
          }
        });
        cancel = () => {
          sub.unsubscribe();
          con.postMessage({
            header: {
              cid,
              asyncModel: 'requestStream' as AsyncModel,
              type: 'UNSUBSCRIBE',
            },
          });
          con.removeEventListener('message', listener);
          clearTimeout(to);
        };
      });

      return () => {
        if (typeof cancel === 'function') {
          cancel();
        } else {
          cancel = true;
        }
      };
    });
  }
  function shutdown(address: string) {
    shutdown$.next(address);
  }
  return { requestResponse, requestStream, shutdown };
}

export function createServer(address: string, serviceCall: ServiceCall) {
  const openSubs: any = {};
  const shutdownSig$: any = new Subject();
  listen(address + '/transport', (msg, port) => {
    if (msg.data.header && msg.data.header.cid) {
      switch (msg.data.header.asyncModel) {
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
          if (msg.data.header.type === 'UNSUBSCRIBE') {
            openSubs[msg.data.header.cid] && openSubs[msg.data.header.cid].unsubscribe();
            break;
          }
          port.postMessage({
            header: {
              cid: msg.data.header.cid,
              type: 'ACK',
            },
          });
          openSubs[msg.data.header.cid] = serviceCall
            .requestStream(msg.data.msg)
            .pipe(
              takeUntil(
                shutdownSig$.pipe(
                  catchError((_) => {
                    port.postMessage({
                      header: {
                        cid: msg.data.header.cid,
                        error: 'Transport server shutdown',
                        type: 'ERROR',
                      },
                    });
                    return throwError('server shutdown');
                  })
                )
              )
            )
            .subscribe(
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

  return () => shutdownSig$.error('server shutdown');
}
