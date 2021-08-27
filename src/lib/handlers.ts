import fs from "fs";
import { IncomingHttpHeaders } from "http";
import path from "path";
import { ParsedUrlQuery } from "querystring";

type cb = (
  statusCode: number,
  payload: object | Buffer | string,
  contentType?: string
) => void;
type data = {
  "path": string | null;
  "trimmedPath": string | undefined;
  "queryStrObj": ParsedUrlQuery;
  "payload": string;
  "method": string | undefined;
  "headers": IncomingHttpHeaders;
};
class Handlers {
  constructor() {}

  hello(data?: data, cb?: cb) {
    const payloadOut = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../api/api.json")).toString()
    );
    payloadOut.Date = Date.now();
    payloadOut.method = data?.method?.toUpperCase();
    // payloadOut.protocol = data?.headers;

    return typeof cb === "function" ? cb(200, payloadOut) : payloadOut;
  }
  $404(data?: data, cb?: cb) {
    const payloadOut = {
      "Error": `route doesn't exist /${data?.trimmedPath} 🥵🥵🥵🥵`,
    };
    return typeof cb === "function" ? cb(404, payloadOut) : payloadOut;
  }
}

export const handlers = new Handlers();
