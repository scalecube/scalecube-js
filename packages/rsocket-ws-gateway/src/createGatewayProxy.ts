import { Observable } from 'rxjs';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import { RSocketClient, JsonSerializers } from 'rsocket-core';
import { MicroserviceApi } from '@scalecube/api';
import { validateServiceDefinition, getQualifier } from '@scalecube/utils';

interface Proxy {
  [state: string]: any;
}

type ConnectionOptions = Partial<{
  keepAlive: number;
  lifetime: number;
}>;

export function createGatewayProxy(
  url: string,
  definition: MicroserviceApi.ServiceDefinition,
  requestResponse?: any,
  requestStream?: any,
  options?: ConnectionOptions
): Promise<Proxy>;
export function createGatewayProxy(
  url: string,
  definition: MicroserviceApi.ServiceDefinition[],
  requestResponse?: any,
  requestStream?: any,
  options?: ConnectionOptions
): Promise<Proxy[]>;
export function createGatewayProxy(
  url: string,
  definitions: any,
  customRequestResponse?: any,
  customRequestStream?: any,
  options?: ConnectionOptions
): any {
  const isDefinitionsArray = Array.isArray(definitions);
  let defs: MicroserviceApi.ServiceDefinition[];
  if (!isDefinitionsArray) {
    defs = [definitions];
  } else {
    defs = definitions;
  }
  const proxies: Proxy[] = [];
  let socket;
  return new Promise(async (resolve, reject) => {
    socket = await connect(url, options).catch((e) => {
      reject(e);
    });

    defs.forEach((definition) => {
      const { serviceName, methods } = definition;
      validateServiceDefinition(definition);
      const proxy: Proxy = {};
      Object.keys(methods).forEach((method) => {
        const asyncModel = methods[method].asyncModel;
        const qualifier = getQualifier({ serviceName, methodName: method });
        proxy[method] = (() => {
          switch (asyncModel) {
            case 'requestResponse':
              return customRequestResponse
                ? customRequestResponse(socket, qualifier)
                : requestResponse(socket, qualifier);
            case 'requestStream':
              return customRequestStream ? customRequestStream(socket, qualifier) : requestStream(socket, qualifier);
            default:
              reject(new Error('Unknown asyncModel'));
          }
        })();
      });
      proxies.push(proxy);
    });

    resolve(isDefinitionsArray ? proxies : proxies[0]);
  });
}

const connect = (url, options: ConnectionOptions = {}) => {
  return new Promise((resolve, reject) => {
    const client = new RSocketClient({
      serializers: JsonSerializers,
      setup: {
        dataMimeType: 'application/json',
        keepAlive: options.keepAlive || 100000,
        lifetime: options.lifetime || 100000,
        metadataMimeType: 'application/json',
      },
      transport: new RSocketWebSocketClient({ url }),
    });
    client.connect().subscribe({
      onComplete: (socket: any) => {
        // console.log('Connected to ' + url);
        resolve(socket);
      },
      onError: (error: any) => {
        // console.log('Err', error);
        reject({ message: 'Connection error ' + error.toString() });
      },
    });
  });
};

const requestResponse = (socket, qualifier) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      socket
        .requestResponse({
          data: {
            qualifier,
            data: args,
          },
        })
        .subscribe({
          onComplete: ({ data }) => {
            resolve(data);
          },
          onError: (e: any) => {
            reject(e);
          },
        });
    });
  };
};

const requestStream = (socket, qualifier) => {
  return (...args) => {
    return new Observable((observer) => {
      let canceled = false;
      let cancel = () => {
        canceled = true;
      };
      socket
        .requestStream({
          data: {
            qualifier,
            data: args,
          },
        })
        .subscribe({
          onSubscribe(subscription) {
            if (canceled) {
              subscription.cancel();
              return;
            }
            cancel = subscription.cancel;
            subscription.request(2147483647);
          },
          onNext: ({ data }) => {
            observer.next(data);
          },
          onComplete: () => {
            observer.complete();
          },
          onError: (e: any) => {
            observer.error(e);
          },
        });
      return () => cancel();
    });
  };
};
