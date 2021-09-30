import http from "http";
import https from "http";
import config from "./config";
import $unified from "./unified.server";

interface Server {
  httpServer: http.Server;
  httpsServer: http.Server;
  init: () => void;
}
const server: Server = {
  httpServer: http.createServer((req, res) => {
    $unified(req, res);
  }),
  httpsServer: https.createServer((req, res) => {
    $unified(req, res);
  }),

  init() {},
};

server.init = () => {
  server.httpServer.listen(config.httpPort, () => {
    console.log(
      `Http sever listening on ${config.Mode} mode @${config.httpPort.port}`
    );
  });
  server.httpsServer.listen(config.httpsPort, () => {
    console.log(
      `Https sever listening on ${config.Mode} mode @${config.httpsPort.port}`
    );
  });
};

export default server;
