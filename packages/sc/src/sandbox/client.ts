import http from 'http';
import * as fs from 'fs';

export function client(port: number) {
  http
    .createServer((req, res) => {
      fs.readFile(__dirname + '/index.html', (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
        }
        res.writeHead(200);
        res.end(data);
      });
    })
    .listen(port);
}
