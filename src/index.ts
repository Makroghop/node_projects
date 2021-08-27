import server from "./lib/server";

interface App {
  init: () => void;
}
const app: App = {
  init() {},
};

app.init = () => {
  server.init();
  console.log("sever started");
};

app.init();
