import { IncomingMessage, ServerResponse } from "http";
import { StringDecoder } from "string_decoder";
import url from "url";
import { handlers } from "./handlers";
import routes from "./routes";

const $unified = (req: IncomingMessage, res: ServerResponse) => {
  const $parsedUrl = url.parse(`${req.url}`, true);
  const $path = $parsedUrl.pathname;
  const $trimmedPath = $path?.replace(/^\/+|\/+$/g, "");
  const $queryStrObj = $parsedUrl.query;
  const $method = req.method?.toLocaleLowerCase();
  const $headers = req.headers;

  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  req.on("data", (chunk) => (buffer += decoder.write(chunk)));
  req.on("end", () => (buffer += decoder.end()));

  const $asTrimmed = $trimmedPath as keyof typeof routes;

  const $chosenHandler =
    typeof routes[$asTrimmed] !== "undefined"
      ? routes[$asTrimmed]
      : handlers.$404;

  const data = {
    "path": $path,
    "trimmedPath": $trimmedPath,
    "queryStrObj": $queryStrObj,
    "payload": buffer,
    "method": $method,
    "headers": $headers,
  };

  $chosenHandler(data, ($statusCode, $payload, $contentType) => {
    $statusCode = typeof $statusCode === "number" ? $statusCode : 200;
    $payload = typeof $payload === "object" ? $payload : {};
    $contentType = typeof $contentType === "string" ? $contentType : "json";

    const $payloadStr = JSON.stringify($payload);

    res.setHeader("Content-Type", $contentType);
    res.writeHead($statusCode);

    res.end($payloadStr);
  });
};

export default $unified;
