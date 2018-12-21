// @flow

import { Router, Message, utils, Microservices } from ".";
import { Observable } from "rxjs/Observable";
import { pipe } from "rxjs/util/pipe";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import "rxjs/add/observable/from";
import { isObservable, isPromise } from "./utils";

// Private helper methods
const getInst = (router) => (message) => router.route && router.route(message);
const getMeta = (inst) => !inst ? {} : inst.service.meta || inst.service.constructor.meta || {};

export class ServiceCall {
    router: Router;
    microservices: Microservices;

    constructor(router: Router, ms: Microservices) {
        this.router = router;
        this.microservices = ms;
    }

    serviceCall(message: Message, type: "Observable" | "Promise") {
        const getInstanceOfMessage = getInst(this.router);
        if (!message) {
            throw Error("Error: data was not provided");
        }
        const chain$ = Observable
            .from([message])
            .map((message) => {
                if (!Array.isArray(message.data)) {
                    throw Error("Message format error: data must be Array");
                }
                const inst = getInstanceOfMessage(message);
                if (inst && inst.service) {
                    return ({
                        message,
                        inst,
                        thisMs: this.microservices,
                        meta: getMeta(inst),
                    });
                }
                throw Error(`Service not found error: ${message.serviceName}.${message.method}`);
            })
            .pipe(source$ => this.microservices.preRequest(source$))
            .switchMap(({ inst }) => utils.isLoader(inst) ?
                Observable.from(new Promise(r => inst.service.promise.then(res => r(res)))) :
                Observable.from([inst.service])
            )
            .pipe((response) => {
                const inst = getInstanceOfMessage(message);
                const data = {
                    inst,
                    request: message,
                    thisMs: this.microservices,
                    meta: getMeta(inst),
                };
                return this.microservices.postResponse(response, data);
            })
            .map((service) => {
                if (service[message.method]) {
                    return service;
                }
                throw Error(`Service not found error: ${message.serviceName}.${message.method}`);
            })
            .switchMap((service) => {
                const serviceMethod = service[message.method](...message.data);
                if (isPromise(serviceMethod)) {
                    return Observable.from(serviceMethod);
                } else {
                    if (isObservable(serviceMethod)) {
                        return serviceMethod;
                    } else {
                        throw Error(`Service method not observable error: ${message.serviceName}.${message.method}`);
                    }
                }
            });
        return type === "Promise" ? chain$.toPromise() : chain$;
    }

    invoke(message: Message): Promise<Message> {
        return this.serviceCall(message, "Promise");
    }

    listen(message: Message): Observable<Message> {
        return this.serviceCall(message, "Observable");
    }
}
