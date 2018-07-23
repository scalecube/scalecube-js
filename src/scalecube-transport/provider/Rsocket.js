import RSocketWebSocketClient from 'rsocket-websocket-client';
import WebSocket from 'ws';

export const createClient = () => {
  const client = new RSocketWebSocketClient({
    url: 'wss://echo.websocket.org',
    wsCreator: url => new WebSocket(url)
  });
  console.log('client', client);
  // client.send('test');

  client.connectionStatus().subscribe({
    onNext: onNextData => console.log('onNextData', onNextData),
    onSubscribe: subscription => subscription.request(Number.MAX_SAFE_INTEGER),
  });

  client.connect();
};

