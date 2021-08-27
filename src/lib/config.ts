/////////////////////////////
/////////////////////////////
////////// CONFIG ///////////
/////////////////////////////
/////////////////////////////

import { readFileSync } from "fs";
import path from "path";

const readSsl = (file: string) => {
  return readFileSync(path.join(__dirname, "../http/" + file));
};

const retCert = () => {
  return {
    "cert": readSsl("cert.pem"),
    "key": readSsl("key.pem"),
  };
};
class Environment {
  constructor() {}

  staging() {
    return {
      "Mode": "Staging",
      "httpPort": {
        "port": 3000,
      },

      "httpsPort": {
        "port": 3001,
        "options": retCert(),
      },
    };
  }

  production() {
    return {
      "Mode": "Production",
      "httpPort": {
        "port": 5000,
      },

      "httpsPort": {
        "port": 5001,
        "options": this.retCert(),
      },
    };
  }

  private retCert() {
    return {
      "cert": readSsl("cert.pem"),
      "key": readSsl("key.pem"),
    };
  }
}

const environments = new Environment();

// // const getK$ =
// //   <T extends keyof object, U extends keyof T>(obj: T) =>
// //   (key: U) =>
// //     obj[key];

const tof = process.env.NODE_ENV as keyof typeof environments;

const mode$ = environments[tof] || environments.staging;

export default typeof mode$ === "function" ? mode$() : environments.staging();
