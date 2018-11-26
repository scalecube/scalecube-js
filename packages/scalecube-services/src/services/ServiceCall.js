// @flow

import {Router, Message, utils, Microservices} from '.';
import {Observable, pipe} from 'rxjs/Observable';
// $FlowFixMe
import 'rxjs/add/operator/catch';
import {isObservable} from './utils';

import 'rxjs/add/operator/switchMap';
import 'rxjs/operator/toPromise';
import 'rxjs/add/observable/fromPromise';

const createServiceObserver = (message, service, observer) => {
    const obs = service[message.method](...message.data);
    if (isObservable(obs)) {
        const sub = obs.subscribe(
            val => observer.next(val),
            error => observer.error(error)
        );
        return () => sub.unsubscribe();
    } else {
        observer.error(new Error(`Service method not observable error: ${message.serviceName}.${message.method}`));
        return () => {
        };
    }
};

export class ServiceCall {
    router: Router;
    microservices: Microservices;

    constructor(router: Router, ms) {
        this.router = router;
        this.microservices = ms;
    }

    call(message, type) {

        const chain$ = Observable
            .from([message])
            .map((message) => {
                if (Array.isArray(message.data)) {
                    return message;
                }
                throw Error(`Message format error: data must be Array`);
            })
            .map(message => ({
                message,
                inst: this.router.route(message)
            }))
            .map( (source) => {
                if(source.inst && source.inst.service){
                    return source;
                }
                throw Error(`Service not found error: ${message.serviceName}.${message.method}`);
            })
            .map(source => ({
                ...source,
                thisMs: this.microservices,
                meta: source.inst.service.meta || source.inst.service.constructor.meta || {}
            }))
            .pipe(source$ => this.microservices.preRequest(source$))
            .map( obj => obj.inst )
            .switchMap(inst => {
                const res = utils.isLoader(inst) ?
                    Observable.from(new Promise(r => inst.service.promise.then(res=>r(res)))) :
                    Observable.from([inst.service])
                return res;
                }
            )
            .map( service => {
                if(service[message.method]){
                    return service;
                }
                throw Error(`Service not found error: ${message.serviceName}.${message.method}`);
            })
            .switchMap(service => {
                    return type === "Promise" ?
                        Observable.from(service[message.method](...message.data)) :
                        service[message.method](...message.data)
                }
            );

        return type === "Promise" ? chain$.toPromise() : chain$;
    }

    invoke(message: Message): Promise<Message> {
        return this.call(message, "Promise");
    }

    listen(message: Message): Observable<Message> {
        return this.call(message, "Observable");
    }
}
