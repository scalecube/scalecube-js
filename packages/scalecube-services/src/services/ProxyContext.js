// @flow
import {Observable, pipe} from 'rxjs/Rx';

import 'rxjs/add/operator/switchMap';
import 'rxjs/operator/toPromise';
import 'rxjs/add/observable/fromPromise';
import {Router, RoundRobinServiceRouter, Microservices, ServiceDefinition} from ".";
import type {Message} from ".";


export class ProxyContext {
    myapi: any;
    router: typeof Router;
    // myMW: (msg:Message, mc: Microservices, def: Object) => Message;
    microservices: Microservices;

    constructor(microservices: Microservices) {
        this.microservices = microservices;
        this.router = RoundRobinServiceRouter;
    }

    call(request) {
        const mw = this.microservices.mw;
        //const message = mw(request.message, this.microservices, request.meta);

        const chain$ = Observable
            .from([{
                message: request.message,
                serviceDefinition: request.meta,
                thisMs: this.microservices
            }])
            .pipe(source$ => mw(source$))
            .switchMap(req => request.type === "Promise" ?
                Observable.from(request.dispatcher.invoke(req.message)) :
                request.dispatcher.listen(req.message)
            );

        return request.type === "Promise" ? chain$.toPromise() : chain$;
    }

    /**
     *
     * @param api
     *
     * @param router
     * @return {api}
     */
    createProxy(api: any, router: typeof Router) {
        const dispatcher = this.microservices.dispatcher().router(router).create();
        const meta = api.meta;

        if (!meta) {
            return Error("API must have meta property");
        }

        meta.serviceName = meta.serviceName || meta.name || api.name;
        if (!meta.serviceName) {
            return Error("service name (api.meta.serviceName) is not defined");
        }
        if (!meta.methods) {
            return Error("meta.methods is not defined");
        }
        return new Proxy({}, {
            get: (target, prop) => {
                if (meta.methods[prop]) {
                    return (...args) => {
                        const message = {
                            serviceName: meta.serviceName,
                            method: prop,
                            data: args
                        };
                        if (meta.methods[prop].type !== "Promise" &&
                            meta.methods[prop].type !== "Observable") {
                            return Error(`service method unknown type error: ${meta.serviceName}.${prop}`);
                        }
                        return this.call({
                            message,
                            dispatcher,
                            meta,
                            type: meta.methods[prop].type
                        });
                    };
                }
                return undefined;
            }
        });
    }

    create() {
        return this.createProxy(this.myapi, this.router);
    }

    api(api: any) {
        this.myapi = api;
        return this;
    }
}
