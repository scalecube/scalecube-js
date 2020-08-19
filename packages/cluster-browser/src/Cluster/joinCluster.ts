import { map, mergeAll, tap } from 'rxjs/operators';
import { from, Observable, pipe, Subject } from 'rxjs';
import { ClusterEvent, ClusterOptions, JoinCluster, MembersData } from '@scalecube/api/lib/cluster';
import { getFullAddress } from '@scalecube/utils';
import { createServer, send as sendAddress, on } from './connection';
import { Address } from '@scalecube/api';

function debug(ctx: Context, logname: string, filter: any, ...log: any[]) {
  if (filter(ctx, logname, log)) {
    // tslint:disable-next-line:no-console
    console.log(ctx.address, logname, ...log);
  }
}
// const DEBUG = (ctx: Context, name: string,...log: any[]) => debug(ctx, name, ()=>{
//     return ctx.address === 'pm://defaultHost:8080/b' &&
//         name === 'notify';
// }, ...log);
const DEBUG = (...arg: any[]) => {};

function sendInit(ctx: Context, seed: string) {
  ctx.send(seed, {
    type: 'INIT',
    from: ctx.address,
    sender: ctx.address,
    items: ctx.membersData[ctx.address],
  } as ClusterEvent & { sender: any });
}

function notifyMembersChanged(ctx: Context, send: any, to: string) {
  ctx.members$.subscribe((member) => {
    DEBUG(ctx, 'notify', to, member);
    if (member.from !== to && member.sender !== to) {
      send({
        ...member,
        type: member.type === 'REMOVED' ? 'REMOVED' : 'ADDED',
        sender: ctx.address,
      });
    }
  });
}

function sendMembers(ctx: Context, send: any, to: string) {
  DEBUG(ctx, 'send', to, ctx.membersData);
  Object.keys(ctx.membersData).forEach((address) => {
    if (address !== to) {
      send({
        type: 'ADDED',
        from: address,
        items: ctx.membersData[address],
        sender: ctx.address,
      });
    }
  });
}

function updateMembers(ctx: Context, e: InternalClusterEvent) {
  DEBUG(ctx, 'update', e);
  if (!!ctx.membersData[e.from] === (e.type === 'REMOVED')) {
    // DEBUG(options.address.path, msg.data, membersData[msg.data.from]);
    ctx.members$.next(e);
  }
  switch (e.type) {
    case 'INIT':
      if (e.from !== e.sender) {
        return;
      }
    case 'ADDED':
      ctx.membersData[e.from] = e.items;
      break;
    case 'REMOVED':
      delete ctx.membersData[e.from];
      break;
  }
}
function fromClusterEvent$(address: string) {
  return new Observable<ClusterEvent>((obs) => {
    on(address, (msg: ClusterEvent) => {
      obs.next(msg);
    });
  });
}

interface InternalClusterEvent extends ClusterEvent {
  sender?: string;
}

interface Context {
  send: any;
  address: string;
  members$: Subject<InternalClusterEvent>;
  membersData: MembersData;
}

export const joinCluster: JoinCluster = (options: ClusterOptions) => {
  const seeds$ = from(options.seedAddress || ([] as Address[])).pipe(map((i) => getFullAddress(i)));
  const seedServerEvents$ = createServer(getFullAddress(options.address));

  const ctx: Context = {
    send: sendAddress,
    address: getFullAddress(options.address),
    membersData: {
      [getFullAddress(options.address)]: options.itemsToPublish,
    },
    members$: new Subject(),
  };

  seeds$
    .pipe(
      tap((seed) => sendInit(ctx, seed)),
      tap<string>((seed) => sendMembers(ctx, (msg: any) => ctx.send(seed, msg), seed)),
      tap<string>((seed) => notifyMembersChanged(ctx, (msg: any) => ctx.send(seed, msg), seed)),
      map((seed) => fromClusterEvent$(seed)),
      mergeAll((options.seedAddress && options.seedAddress.length) || 1),
      tap((event) => updateMembers(ctx, event))
    )
    .subscribe();

  seedServerEvents$
    .pipe(
      pipe(
        tap((e: ClusterEvent & { send: any }) => {
          if (e.type === 'INIT') {
            // this will update peers that use it as seed
            sendMembers(ctx, e.send, e.from);
            notifyMembersChanged(ctx, e.send, e.from);
          }
        })
      ),
      // this will get updates from peers
      tap((e) => updateMembers(ctx, e))
    )
    .subscribe();

  return {
    destroy: () => {
      ctx.members$.next({
        items: options.itemsToPublish,
        type: 'REMOVED',
        from: getFullAddress(options.address),
      });

      return new Promise<string>((resolve) => {
        // drain all events
        setTimeout(() => {
          ctx.members$.complete();
          resolve('');
        });
      });
    },
    getCurrentMembersData: () => Promise.resolve(ctx.membersData),
    listen$: () =>
      ctx.members$.pipe(
        map(
          (i: any) =>
            (({
              type: i.type,
              from: i.from,
              items: i.items,
            } as unknown) as ClusterEvent)
        )
      ) as Observable<ClusterEvent>,
  };
};
