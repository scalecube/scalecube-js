import RSocketWebSocketClient from 'rsocket-websocket-client';
import WebSocket from 'ws';
import {JsonSerializers, RSocketClient} from "rsocket-core";

class RSocketProvider {
  constructor() {
    this.client;
  }

  buildClient() {
    this.client = new RSocketClient({
      // send/receive objects instead of strings/buffers
      serializers: JsonSerializers,
      setup: {
        // ms btw sending keepalive to server
        keepAlive: 60000,
        // ms timeout if no keepalive response
        lifetime: 180000,
        // format of `data`
        dataMimeType: 'application/json',
        // format of `metadata`
        metadataMimeType: 'application/json',
      },
      transport: new RSocketWebSocketClient({url: 'ws://localhost:8080', wsCreator: url => new WebSocket(url)}),
    });
  }
}

const client = new RSocketClient({
  // send/receive objects instead of strings/buffers
  serializers: JsonSerializers,
  setup: {
    // ms btw sending keepalive to server
    keepAlive: 60000,
    // ms timeout if no keepalive response
    lifetime: 180000,
    // format of `data`
    dataMimeType: 'application/json',
    // format of `metadata`
    metadataMimeType: 'application/json',
  },
  transport: new RSocketWebSocketClient({url: 'ws://localhost:8080', wsCreator: url => new WebSocket(url)}),
});

// Open the connection
client.connect().subscribe({
  onComplete: socket => {
    const flowable = socket.requestStream({
      data: {
        hello: 'world',
        account: 'yes',
        text: 'Come on'
      },
      metadata: {
        q: '/greeting/pojo/one'
      },
    });

    flowable.subscribe({
      onComplete: (data) => console.log('done', data),
      onNext: (data) => console.log('data', data),
      onError: error => console.error(error),
      onSubscribe: sub => sub.request(1)
    });


  },
  onError: error => console.error(error),
  onSubscribe: cancel => {/* call cancel() to abort */}
});

