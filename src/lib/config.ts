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
      "hashingSecrete": "aHashingSecrete",
      "httpPort": {
        "port": 3000,
      },

      "httpsPort": {
        "port": 3001,
        "options": retCert(),
      },
      "templateGlobals": {
        "appTitle": "Pizza App",
        "@c": new Date().getFullYear(),
        "companyName": "Pizza .INC",
        "baseUrl": "http://localhost:3000",
      },
    };
  }

  production() {
    return {
      "Mode": "Production",
      "hashingSecrete": "aHashingSecrete",
      "httpPort": {
        "port": 5000,
      },

      "httpsPort": {
        "port": 5001,
        "options": this.retCert(),
      },
      "templateGlobals": {
        "appTitle": "Pizza App",
        "@c": new Date().getFullYear(),
        "companyName": "Pizza .INC",
        "baseUrl": "http://localhost:3000",
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

const tof = process.env.NODE_ENV as keyof typeof environments;

const mode$ = environments[tof] || environments.staging;

export default typeof mode$ === "function" ? mode$() : environments.staging();
