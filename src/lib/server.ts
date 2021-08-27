import http from "http";
import config from "./config";
import $unified from "./unified.server";

interface Server {
  httpServer: http.Server;
  init: () => void;
}
const server: Server = {
  httpServer: http.createServer((req, res) => {
    $unified(req, res);
  }),

  init() {},
};

server.init = () => {
  server.httpServer.listen(config.httpPort, () => {
    console.log("server at 3000");
  });
};

export default server;
