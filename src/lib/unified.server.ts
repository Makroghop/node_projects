import { IncomingMessage, ServerResponse } from "http";
import { StringDecoder } from "string_decoder";
import url from "url";
import { handlers } from "./handlers";
import { helpers } from "./helpers";
import routes from "./routes";

const $unified = (req: IncomingMessage, res: ServerResponse) => {
  const $parsedUrl = url.parse(`${req.url}`, true);
  const $path = $parsedUrl.pathname;
  const $trimmedPath = ($path as string).replace(/^\/+|\/+$/g, "");
  const $queryStrObj = $parsedUrl.query;
  const $method = req.method?.toLocaleLowerCase();
  const $headers = req.headers;

  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  req.on("data", (chunk) => (buffer += decoder.write(chunk)));
  req.on("end", () => {
    buffer += decoder.end();

    const $asTrimmed = $trimmedPath as keyof typeof routes;

    let $chosenHandler =
      typeof routes[$asTrimmed] !== "undefined"
        ? routes[$asTrimmed]
        : handlers.$404;

    if ($trimmedPath) {
      $chosenHandler =
        $trimmedPath?.indexOf("public/") > -1
          ? handlers.public
          : $chosenHandler;
    }
    const data = {
      "path": $path,
      "trimmedPath": $trimmedPath,
      "queryStrObj": $queryStrObj,
      "payload": helpers.parseJson(buffer),
      "method": $method,
      "headers": $headers,
    };

    $chosenHandler(data, ($statusCode, $payload, $contentType) => {
      $statusCode = typeof $statusCode === "number" ? $statusCode : 200;

      $contentType = typeof $contentType === "string" ? $contentType : "json";

      let $payloadStr: string | any = "";

      switch ($contentType) {
        case "json":
          res.setHeader("Content-Type", "application/json");
          $payload = typeof $payload === "object" ? $payload : {};
          $payloadStr = JSON.stringify($payload);
          break;

        case "html":
          res.setHeader("Content-Type", "text/html");
          $payloadStr = typeof $payload === "string" ? $payload : "";
          break;

        case "css":
          res.setHeader("Content-Type", "text/css");
          $payloadStr = typeof $payload !== "undefined" ? $payload : "";
          break;

        case "plain":
          res.setHeader("Content-Type", "text/plain");
          $payloadStr = typeof $payload !== "undefined" ? $payload : "";
          break;

        case "favicon":
          res.setHeader("Content-Type", "image/x-icon");
          $payloadStr = typeof $payload !== "undefined" ? $payload : "";
          break;

        case "png":
          res.setHeader("Content-Type", "image/png");
          $payloadStr = typeof $payload !== "undefined" ? $payload : "";
          break;

        case "jpg":
          res.setHeader("Content-Type", "image/jpeg");
          $payloadStr = typeof $payload !== "undefined" ? $payload : "";
          break;

        default:
          return;
      }

      res.writeHead($statusCode);

      res.end($payloadStr);
    });
  });
};

export default $unified;
