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

  //   const getK$ =
  //     <T extends  keyof  Object, U extends keyof T>(obj: T) =>
  //     (key: U) =>
  //       obj[key];

  //   const emp = { "name": "goat", "skims": 1 };
  // var i = getK$<"propertyIsEnumerable", "toString">("propertyIsEnumerable");
  //   console.log(i);
};

app.init();
