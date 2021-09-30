import { createHmac } from "crypto";
import path from "path";
import { appDb } from "./app.db";
import config from "./config";
import fs from "fs";

class Helpers {
  constructor() {}

  hash(stringToHash: string) {
    let hash;
    stringToHash && stringToHash.length > -1
      ? (hash = createHmac("sha256", config.hashingSecrete)
          .update(stringToHash)
          .digest("hex"))
      : false;

    return hash;
  }

  genRandStr(len: number): string {
    len ? len : false;

    let allChar = "abcdefghijklmnopqrstuvwxyz0123456789",
      l = 1,
      allCharLen = allChar.length,
      str = "";

    do {
      const randomChar = allChar.charAt(Math.floor(Math.random() * allCharLen));
      str += randomChar;
      ++l;
    } while (l <= len);

    return str;
  }

  parseJson(obj: string) {
    try {
      return JSON.parse(obj);
    } catch (e) {
      return false;
    }
  }

  validateToken(id: string | false, email: string, cb: (...a: any) => void) {
    appDb.read("tokens", id as string, (err, data) => {
      if (!err && data) {
        data.email === email && data.expires > Date.now()
          ? cb(true)
          : cb(false);
      } else cb(false);
    });
  }

  // get template content, and use the data provided if any
  getTemplate(
    name: string | false,
    data: object,
    cb: (...params: any) => void
  ) {
    name = typeof name === "string" && name.length > 0 ? name : false;
    data = typeof data === "object" && data !== null ? data : {};

    //  if there is a name
    if (name) {
      const templateDir = path.join(__dirname, "/../templates/");
      fs.readFile(`${templateDir}${name}.html`, "utf8", (err, template) => {
        !err && template && template.length > 0
          ? // interpolate it
            cb(false, this.interpolate(template, data))
          : // no template
            cb("no template could be found");
      });
    } else cb(`A valid template name was not specified (${name})`);
  }

  // takes a given from a template, find/replace it
  interpolate(str: string | false, data: object) {
    str = typeof str === "string" && str.length > 0 ? str : false;
    data = typeof data === "object" && data !== null ? data : {};

    // add the templateGlobals data object from the config file, then prepend their key with "global."
    // which is gained from the data in the template.

    for (const keyName in config.templateGlobals) {
      if (
        Object.prototype.hasOwnProperty.call(config.templateGlobals, keyName)
      ) {
        (data as any)[`global.${keyName}`] =
          config.templateGlobals[
            keyName as keyof typeof config.templateGlobals
          ];
      }

      // For each key in the data object, insert its value into the string at the corresponding placeholder
    }
    for (const key in data) {
      Object.prototype.hasOwnProperty.call(data, key)
        ? (str = (str as string).replace(`{${key}}`, (data as any)[key]))
        : false;
    }
    return str;
  }

  /* add the permanent templates "header" 
  file acting as the index/main page that is 
  concatenated from a position with the string 
  from another page acting as a component
  */
  addUniversalTemplates(
    str: string | false,
    data: object,
    cb: (...params: any) => void
  ) {
    str = typeof str === "string" && str.length > 0 ? str : "";
    data = typeof data === "object" && data !== null ? data : {};

    this.getTemplate("header", data, (err, header) => {
      if (!err && header) {
        header = header
          // this algo will later be replaced soon hopefully 😁😁😁
          .replace(
            `<div class="__root__"></div>`,
            `<div class="__root__">${str}</div>`
          );
        cb(false, header);
      } else cb("could not get header template");
    });
  }

  getStaticAssets(filename: string | false, cb: (...ags: any) => void) {
    filename =
      typeof filename == "string" && filename.length > 0 ? filename : false;
    if (filename) {
      var publicDir = path.join(__dirname, "/../public/");
      fs.readFile(publicDir + filename, function (err, data) {
        if (!err && data) {
          cb(false, data);
        } else {
          cb("No file could be found");
        }
      });
    } else {
      cb("A valid file name was not specified");
    }
  }
}
export const helpers = new Helpers();
