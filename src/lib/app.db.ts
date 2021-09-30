/*

`oooooooooooooooooooooooooooooooooooo
 oooooooooooooooooooooooooooooooooooo
 oooooooo  CRUD OPERATIONS  ooooooooo
 oooooooooooooooooooooooooooooooooooo
 oooooooooooooooooooooooooooooooooooo
`
*/

// oooooooo  Dependencies  oooooooo

import fs from "fs";
import path from "path";
import { helpers } from "./helpers";

type d = {} | boolean | any;

class AppDB {
  private basedir = "";
  private validPaths: d = {};
  constructor() {
    this.basedir = path.join(__dirname, "..", ".data");
    this.validPaths = {};
  }

  private setFile(dirname: string, filename: string, or: boolean) {
    return or === true
      ? path.join(this.basedir, dirname, filename + ".json")
      : path.join(dirname, filename + ".json");
  }

  private makePath(dirname: string, cb: (...args: any) => void) {
    const bs = this.validPaths;
    if (this.validPaths[dirname as keyof typeof bs]) return cb();
    fs.mkdir(path.join(this.basedir, dirname), function (err) {
      bs[dirname] = true;
      cb();
    });
  }

  private write(
    dirname: string,
    filename: string,
    data: any | string,
    options: object,
    cb: (...a: any) => void
  ) {
    this.makePath(dirname, () => {
      try {
        fs.writeFile(
          this.setFile(dirname, filename, true),
          JSON.stringify(data),
          options,
          (err) => {
            cb(
              err
                ? "could not " +
                    options["opera" as keyof typeof options] +
                    " file:" +
                    path.join(dirname, filename + ".json")
                : undefined
            );
          }
        );
      } catch (e) {
        console.log(e);
        cb("error occurred during this operation");
      }
    });
  }

  create(
    dirname: string,
    filename: string,
    data: any | string,
    cb: (...a: any) => void
  ) {
    this.write(
      dirname,
      filename,
      data,
      { "flag": "wx", "opera": "create" },
      cb
    );
  }

  read(dirname: string, filename: string, cb: (...a: any) => void) {
    try {
      fs.readFile(
        this.setFile(dirname, filename, true),
        "utf8",
        (err, data) => {
          if (!err && data) {
            cb(false, helpers.parseJson(data));
          } else
            cb(`Error: unable to read file.\n Error Issue reported: ${err}`);
        }
      );
    } catch (e) {
      console.log(e);
      cb("error reading json file");
    }
    return;
  }
  update(
    dirname: string,
    filename: string,
    data: any | string,
    cb: (...a: any) => void
  ) {
    this.write(
      dirname,
      filename,
      data,
      { "flag": "r+", "opera": "update" },
      cb
    );
  }
  delete(dirname: string, filename: string, cb: (...a: any) => void) {
    try {
      fs.unlink(this.setFile(dirname, filename, true), (err) => {
        if (!err) cb(`Success deleting file`);
        else
          cb(
            `Error: could not delete file: ${this.setFile(
              dirname,
              filename,
              false
            )}`
          );
      });
    } catch (e) {
      console.log(e);
      cb("error occurred during this operation");
    }
  }

  list(dirname: string, cb: (...a: any) => void) {
    try {
      fs.readdir(
        this.setFile(dirname, "/", true).replace(".json", ""),
        (err, filenames) => {
          if (!err && filenames && filenames.length > 0) {
            const trimmedFiles: string[] = [];
            filenames.forEach((fn) => {
              fn = fn.replace(".json", "");

              trimmedFiles.push(fn);
            });
            cb(false, trimmedFiles);
          } else cb(err, filenames);
        }
      );
    } catch (e) {
      console.log(e);
      cb("error occurred listing files");
    }
  }
}
export const appDb = new AppDB();
