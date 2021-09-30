/*
 *
 * OOOOOOOOOOOOOOOOOOOOOOOOOOO
 * OOOOO HANDLERS STRUCT OOOOO
 * OOOOOOOOOOOOOOOOOOOOOOOOOOO
 */

// OOOOO DEPENDENCIES OOOOO
// -system-
import fs from "fs";
import { IncomingHttpHeaders, IncomingMessage } from "http";
import path from "path";
import { ParsedUrlQuery } from "querystring";

// -Directory-
import { appDb } from "./app.db";
import { helpers } from "./helpers";

type cb = (
  statusCode: number,
  payload: object | Buffer | string,
  contentType?: string
) => void;

type data = {
  "path": string | null;
  "trimmedPath": string | undefined;
  "queryStrObj": ParsedUrlQuery;
  "payload": any | string;
  "method": IncomingMessage["method"];
  "headers": IncomingHttpHeaders;
};

/**
 *
 * OOOOOOOOOOOOOOOOOOOOOOOOO
 * OOOOO JSON HANDLERS OOOOO
 * OOOOOOOOOOOOOOOOOOOOOOOOO
 *
 */

/* 
  USERS
 */
const _users = () => {
  return {
    "post": (data: data, cb: cb) => $userPost(data, cb),
    "put": (data: data, cb: cb) => $userPut(data, cb),
    "get": (data: data, cb: cb) => $userGet(data, cb),
    "delete": (data: data, cb: cb) => $userDel(data, cb),
  };
};

/* 
  USER-POST
  
 # Json Payload:
   *
   *
    {
      email: a valid email address : <((string))>,
      name: A name : <((string))>, 
      address: A street address with a trimmed length > | = 14 <((string))>
      password: A strong password : <((string))>
    }
   *
   *  
   .

  # Response if all tests are passed 
    *
    *
    statusCose : 200
    successMessage : "Created new user"
    *
    *
    .
  


*/
const $userPost = (data: data, cb: cb) => {
  const email =
    typeof data.payload.email === "string" &&
    data.payload.email.trim().length > 0
      ? data.payload.email.trim()
      : false;

  //
  const name =
    typeof data.payload.name === "string" && data.payload.name.trim().length > 0
      ? data.payload.name.trim()
      : false;
  //
  const address =
    typeof data.payload.address === "string" &&
    data.payload.address.trim().length >= 14
      ? data.payload.address.trim()
      : false;

  //
  const password =
    typeof data.payload.password === "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (email && name && address && password) {
    appDb.read("users", email, (err, user) => {
      if (err) {
        const hashedPassword = helpers.hash(password);
        const orders: string[] = [];

        if (hashedPassword) {
          const signUpObj = {
            "email": email,
            "name": name,
            "address": address,
            "orders": orders,
            "hashedPassword": hashedPassword,
          };

          appDb.create("users", email, signUpObj, (err) => {
            if (err) {
              console.log(err);
              cb(500, { "Error": "Could not create new user" });
            } else cb(200, { "Success": "created new user" });
          });
        } else cb(500, { "Error": "Could not hash user password" });
      } else cb(400, { "Error": "user in existence" });
    });
  } else cb(400, { "": "missing required field(s)" });
};

const $userPut = (data: data, cb: cb) => {
  const email =
    typeof data.payload.email === "string" &&
    data.payload.email.trim().length > 0
      ? data.payload.email.trim()
      : false;
  //
  const name =
    typeof data.payload.name === "string" && data.payload.name.trim().length > 0
      ? data.payload.name.trim()
      : false;
  //
  const address =
    typeof data.payload.address === "string" &&
    data.payload.address.trim().length >= 14
      ? data.payload.address.trim()
      : false;

  //
  const password =
    typeof data.payload.password === "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (email) {
    if (password || name || address) {
      const token =
        typeof data.headers.token === "string" ? data.headers.token : false;

      helpers.validateToken(token, email, (isValidToken) => {
        if (isValidToken) {
          try {
            appDb.read("users", email, (err, data) => {
              if (!err && data) {
                if (password)
                  (data.hashedPassword = ""),
                    (data.hashedPassword = helpers.hash(password));
                if (name) (data.name = ""), (data.name = name);
                if (address) (data.address = ""), (data.address = address);

                try {
                  appDb.update("users", email, data, (err) => {
                    !err
                      ? cb(200, {})
                      : cb(500, { "Error": "Could not update user" });
                  });
                } catch (e) {
                  console.log(e);
                  cb(500, e as object);
                }
              } else cb(404, { "Error": "user does not exist" });
            });
          } catch (e) {
            console.log("err", e);
            cb(500, e as object);
          }
        } else
          cb(403, {
            "Error": "Missing required token in header, or token is invalid.",
          });
      });
    } else cb(200, { "Error": "Missing filed(s) to update" });
  } else cb(200, { "Error": "Missing required filed(s)" });
};

const $userGet = (data: data, cb: cb) => {
  const email =
    typeof data.payload.email === "string" &&
    data.payload.email.trim().length > 0
      ? data.payload.email.trim()
      : false;

  if (email) {
    const token =
      typeof data.headers.token === "string" ? data.headers.token : false;

    helpers.validateToken(token, email, (isValidToken) => {
      if (isValidToken) {
        appDb.read("users", email, (err, data) => {
          if (!err && data) {
            delete data.hashedPassword;
            cb(200, data);
          } else cb(404, {});
        });
      } else
        cb(403, {
          "Error": "Missing required token in header, or token is invalid.",
        });
    });
  } else cb(400, { "Error": "Missing required field(s)" });
};

const $userDel = (data: data, cb: cb) => {
  const email =
    typeof data.payload.email === "string" &&
    data.payload.email.trim().length > 0
      ? data.payload.email.trim()
      : false;

  if (email) {
    const token =
      typeof data.headers.token === "string" ? data.headers.token : false;

    helpers.validateToken(token, email, (isValidToken) => {
      if (isValidToken) {
        appDb.read("users", email, (err, data) => {
          if (!err && data)
            appDb.delete("users", email, (msg) => {
              msg
                ? cb(200, "successfully deleted the user")
                : cb(500, { "Error": "Could not delete the user" });
            });
          else cb(404, { "Error": "Could not find user to delete" });
        });
      } else
        cb(403, {
          "Error": "Missing required token in header, or token is invalid.",
        });
    });
  } else cb(400, { "Error": "Missing required field(s)" });
};

// tokens
const _tokens = () => {
  return {
    "post": (data: data, cb: cb) => $tokenPost(data, cb),
    "put": (data: data, cb: cb) => $tokenPut(data, cb),
    "get": (data: data, cb: cb) => $tokenGet(data, cb),
    "delete": (data: data, cb: cb) => $tokenDel(data, cb),
  };
};

const $tokenPost = (data: data, cb: cb) => {
  const email =
    typeof data.payload.email === "string" &&
    data.payload.email.trim().length > 0
      ? data.payload.email.trim()
      : false;

  //
  const password =
    typeof data.payload.password === "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (password && email)
    appDb.read("users", email, (err, data) => {
      if (!err && data) {
        const hashedPassword = helpers.hash(password);

        if (hashedPassword === data.hashedPassword) {
          const tokenId = helpers.genRandStr(20);

          const expires = Date.now() + 1000 * 60 * 60;

          const tokenObject = {
            "id": tokenId,
            "email": email,
            "expires": expires,
          };
          appDb.create("tokens", tokenId, tokenObject, (err) => {
            if (err) {
              console.log(err);
              cb(500, { "Error": "Could not create token" });
            } else cb(200, tokenObject);
          });
        } else
          cb(400, {
            "ERROR":
              "Password did not match the specified user's stored password",
          });
      } else cb(400, { "ERROR": "could not find the specified user" });
    });
  else cb(400, { "Error": "Missing required field(s)" });
};

const $tokenPut = (data: data, cb: cb) => {
  const id =
    typeof data.payload.id === "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;

  const extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? true
      : false;

  if (id && extend)
    appDb.read("tokens", id, (err, data) => {
      if (!err && data)
        if (data.expires > Date.now()) {
          data.expires = "";
          data.expires = Date.now() + 1000 * 60 * 60;

          appDb.update("tokens", id, data, (err) => {
            !err ? cb(200, {}) : cb(500, { "Error": "Could not update token" });
          });
        } else
          cb(401, {
            "Error": "The token has already expired, and cannot be extended.",
          });
      else
        cb(404, {
          "Error": "The specified user does not exist",
        });
    });
  else
    cb(400, { "Error": "Missing required field(s) or field(s) are invalid." });
};

const $tokenGet = (data: data, cb: cb) => {
  const id =
    typeof data.queryStrObj.id === "string" &&
    data.queryStrObj.id.trim().length === 20
      ? data.queryStrObj.id.trim()
      : false;

  if (id)
    appDb.read("tokens", id, (err, data) => {
      !err
        ? cb(200, data)
        : cb(404, { "Error": "Could not find the specified token" });
    });
  else cb(400, { "Error": "Missing required input(s)" });
  // console.log(data.queryStrObj.id?.length);
};

const $tokenDel = (data: data, cb: cb) => {
  const id =
    typeof data.queryStrObj.id === "string" &&
    data.queryStrObj.id.trim().length === 20
      ? data.queryStrObj.id.trim()
      : false;

  if (id) {
    appDb.read("tokens", id, (err, data) => {
      if (!err && data) {
        appDb.delete("tokens", id, (msg) => {
          msg
            ? cb(200, "successfully deleted the token")
            : cb(500, { "Error": "Could not delete the token" });
        });
      } else cb(404, { "Error": "Could not find the specified token" });
    });
  } else cb(400, { "Error": "Missing required field(s)" });
};

// menu
const _menu = () => {
  return {
    "post": (data: data, cb: cb) => $menuPost(data, cb),
    "put": (data: data, cb: cb) => $menuPut(data, cb),
    "get": (data: data, cb: cb) => $menuGet(data, cb),
    "delete": (data: data, cb: cb) => $menuDel(data, cb),
  };
};

const $menuPost = (data: data, cb: cb) => {
  const description =
    typeof data.payload.description === "string" &&
    data.payload.description.trim().length > -1
      ? data.payload.description
      : false;

  const image =
    typeof data.payload.image === "string" &&
    data.payload.image.trim().length > -1
      ? data.payload.image
      : false;

  const price =
    typeof data.payload.price === "number" && data.payload.price >= 1
      ? data.payload.price
      : false;

  if (description && image && price) {
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    appDb.read("tokens", token as string, (err, data) => {
      if (!err && data) {
        const email = data.email;

        appDb.read("users", email, (err, data) => {
          if (!err && data) {
            // const userMenu =
            //   typeof data.orders === "object" && data.orders instanceof Array
            //     ? data.orders
            //     : [];

            const menuId = helpers.genRandStr(20);

            const menuObj = {
              "id": menuId,
              "description": description,
              "image_url": image,
              "price": price,
              "email": email,
            };

            appDb.create("menu", menuId, menuObj, (err) => {
              if (err) {
                console.log(err);
                cb(500, { "Error": "Could not create new menu" });
              } else cb(200, menuObj);
            });
          } else cb(403, {});
        });
      } else cb(403, {});
    });
  } else {
    cb(400, {
      "Error": "Missing required inputs, or inputs are invalid",
    });
  }
};
//
const $menuPut = (data: data, cb: cb) => {
  const id =
    typeof data.queryStrObj.id === "string" &&
    data.queryStrObj.id.trim().length > 20
      ? data.queryStrObj.id
      : false;

  const description =
    typeof data.payload.description === "string" &&
    data.payload.description.trim().length > -1
      ? data.payload.description
      : false;

  const image =
    typeof data.payload.image === "string" &&
    data.payload.image.trim().length > -1
      ? data.payload.image
      : false;

  const price =
    typeof data.payload.price === "number" && data.payload.price >= 1
      ? data.payload.price
      : false;

  if (id) {
    if (description || image || price) {
      const token =
        typeof data.headers.token == "string" ? data.headers.token : false;
      appDb.read("menu", id, (err, data) => {
        if (!err && data) {
          helpers.validateToken(token, data.email, (isValidToken) => {
            if (isValidToken) {
              if (description) {
                data.description = description;
              }
              if (image) {
                data.image_url = image;
              }
              if (price) {
                data.price = price;
              }

              appDb.update("menu", id, data, (err) => {
                !err
                  ? cb(200, {})
                  : cb(500, { "Error": " could not update menu" });
              });
            } else cb(403, {});
          });
        } else cb(400, { "Error": "menu ID did not exist." });
      });
    } else cb(400, { "Error": "Missing required field(s)" });
  } else cb(400, { "Error": "Missing required field" });
};

//
const $menuGet = (data: data, cb: cb) => {
  const id =
    typeof data.queryStrObj.id === "string" &&
    data.queryStrObj.id.trim().length === 20
      ? data.queryStrObj.id
      : false;

  const desc =
    typeof data.queryStrObj.desc === "string" &&
    data.queryStrObj.desc.length > -1
      ? data.queryStrObj.desc
      : false;

  if (id) {
    const token =
      typeof data.headers.token === "string" ? data.headers.token : false;

    appDb.read("menu", id as string, (err, data) => {
      if (!err && data) {
        helpers.validateToken(token, data.email, (isValidToken) => {
          if (isValidToken) {
            cb(200, data);
          } else cb(403, {});
        });
      } else cb(404, {});
    });
  } else {
    appDb.list("menu", (err, menu_files) => {
      if (!err && menu_files && menu_files.length > 0) {
        // cb(200, menu_files);
        const drilled = menu_files.forEach((mf: string) => {
          appDb.read("menu", mf, (err, data) => {
            if (!err && data) {
              if (desc) {
                const list = [{ ...data }];
                // data = data.filter((mf: any) => {
                // console.log(list);

                // mf.description.toLowerCase().indexOf(desc) >= 0;
                // });
              } else cb(400, {});
            }
          });
        });
        // cb(400, { "Error": "Missing required field(s) or invalid input" });
      }
    });
  }
};

//
const $menuDel = (data: data, cb: cb) => {
  const id =
    typeof data.queryStrObj.id === "string" &&
    data.queryStrObj.id.trim().length === 20
      ? data.queryStrObj.id
      : false;

  if (id) {
    const token =
      typeof data.headers.token === "string" ? data.headers.token : false;

    appDb.read("menu", id as string, (err, data) => {
      if (!err && data) {
        helpers.validateToken(token, data.email, (isValidToken) => {
          if (isValidToken) {
            appDb.delete("menu", id, (msg) => {
              msg
                ? cb(200, "successfully deleted the menu")
                : cb(500, { "Error": "Could not delete the menu" });
            });
          } else cb(403, {});
        });
      }
    });
  } else cb(400, { "Error": "missing required field(s) or invalid input" });
};

//

// carts
const _carts = () => {
  return {
    "post": (data: data, cb: cb) => $cartPost(data, cb),
    "put": (data: data, cb: cb) => $cartPut(data, cb),
    "get": (data: data, cb: cb) => $cartGet(data, cb),
    "delete": (data: data, cb: cb) => $cartDel(data, cb),
  };
};

const $cartPost = (data: data, cb: cb) => {
  const menuId =
    typeof data.payload.menuId === "string" &&
    data.payload.menuId.trim().length > -1
      ? data.payload.menuId
      : false;

  //
  const quantity =
    typeof data.payload.quantity === "number" && data.payload.quantity >= 1
      ? data.payload.quantity
      : 1;

  if (menuId && quantity) {
    const token =
      typeof data.headers.token === "string" ? data.headers.token : false;

    appDb.read("tokens", token as string, (err, token) => {
      if (!err && data) {
        const email = token.email;
        const cartId = helpers.genRandStr(20);
        appDb.read("cart", email, (err, cartData) => {
          if (err) {
            cartData = { "items": {}, "total": 0 };
          }
          appDb.read("menu", menuId, (err, menu) => {
            if (!err && menu) {
              const item = cartData.items[menuId] || { "quantity": 0 };
              item.price = menu.price;
              item.description = menu.description;
              item.quantity += quantity;
              item.image_url = menu.image_url;
              cartData.items[menuId] = item;
              cartData.total = 0;

              Object.keys(cartData.items).forEach((key) => {
                const item = cartData.items[key];
                cartData.cartId = cartId;
                cartData.email = email;
                item.subtotal = item.price * item.quantity;
                cartData.total += item.subtotal;
              });

              appDb.create("cart", cartId, cartData, (err) => {
                !err ? cb(200, cartData) : cb(500, {});
              });
            } else cb(500, {});
          });
        });
      } else cb(403, {});
    });
  } else cb(400, { "Error": "Missing required fields(s)" });
};

//
const $cartPut = (data: data, cb: cb) => {
  const cartId =
    typeof data.payload.cartId === "string" &&
    data.payload.cartId.trim().length > -1
      ? data.payload.cartId.trim()
      : false;

  const quantity =
    typeof data.payload.quantity === "number" && data.payload.quantity >= 1
      ? data.payload.quantity
      : 1;

  console.log(cartId);

  if (cartId) {
    const token =
      typeof data.headers.token === "string" ? data.headers.token : false;

    if (quantity) {
      appDb.read("cart", cartId, (err, cart) => {
        if (!err && cart) {
          helpers.validateToken(token, cart.email, (isValidToken) => {
            if (isValidToken) {
              const cartKeys: any = [];

              Object.keys(cart.items).forEach((key) => {
                cartKeys.push(key);
              });

              const menu_itemId = cartKeys[0];

              appDb.read("menu", menu_itemId, (err, menu) => {
                if (!err && menu) {
                  const item = cart.items[menu_itemId];
                  if (quantity === 0) {
                    delete cart.items[menu_itemId];
                  } else {
                    item.quantity = quantity;
                  }

                  item.total = 0;

                  Object.keys(cart.items).forEach((key) => {
                    const item = cart.items[key];
                    console.log(item.subtotal);

                    // item.subtotal = item.price * quantity;
                    cart.total += item.subtotal;
                  });

                  appDb.update("cart", cartId, cart, (err) => {
                    !err
                      ? cb(200, {})
                      : cb(500, { "Error": " could not update cart" });
                  });
                } else cb(404, {});
              });
            } else cb(401, {});
          });
        } else cb(500, {});
      });
    } else cb(400, {});
  } else cb(400, { "Error": "Missing required fields(s)" });
};

//
const $cartGet = (data: data, cb: cb) => {
  const cartId =
    typeof data.queryStrObj.id === "string" &&
    data.queryStrObj.id.trim().length === 20
      ? data.queryStrObj.id.trim()
      : false;

  if (cartId) {
    const token =
      typeof data.headers.token === "string"
        ? data.headers.token.trim()
        : false;
    appDb.read("cart", cartId, (err, cart) => {
      if (!err && cart) {
        helpers.validateToken(token, cart.email, (isValidToken) => {
          if (isValidToken) {
            cb(200, cart);
          } else cb(403, {});
        });
      } else cb(404, {});
    });
  } else cb(400, { "Error": "Missing required fields(s)" });
};

//
const $cartDel = (data: data, cb: cb) => {
  const cartId =
    typeof data.queryStrObj.id === "string" &&
    data.queryStrObj.id.trim().length === 20
      ? data.queryStrObj.id.trim()
      : false;

  if (cartId) {
    const token =
      typeof data.headers.token === "string"
        ? data.headers.token.trim()
        : false;

    appDb.read("cart", cartId, (err, cart) => {
      if (!err && cart) {
        helpers.validateToken(token, cart.email, (isValidToken) => {
          if (isValidToken) {
            appDb.delete("cart", cartId, (msg) => {
              msg ? cb(200, msg) : cb(500, {});
            });
          } else cb(403, {});
        });
      } else cb(404, {});
    });
  } else cb(400, { "Error": "Missing required fields(s)" });
};

// tokens
const _orders = () => {
  return {
    "post": (data: data, cb: cb) => $tokenPost(data, cb),
    "put": (data: data, cb: cb) => $tokenPut(data, cb),
    "get": (data: data, cb: cb) => $tokenGet(data, cb),
    "delete": (data: data, cb: cb) => $tokenDel(data, cb),
  };
};

//
class Handlers {
  constructor() {}

  hello(data?: data, cb?: cb) {
    const payloadOut = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../hello/hello.json")).toString()
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

  default(data?: data, cb?: cb) {
    const payloadOut = {};
    return typeof cb === "function" ? cb(200, payloadOut) : payloadOut;
  }

  // html

  index(data: data, cb: cb) {
    // Reject any request that isn't a GET
    if (data.method == "get") {
      // Prepare data for interpolation
      var templateData = {
        "head.title": "This is the title",
        "head.description": "This is the meta description",
        "body.title": "Hello templated world!",
        "body.class": "index",
      };
      helpers.getTemplate("index", templateData, (err, str) => {
        if (!err && str) {
          helpers.addUniversalTemplates(str, templateData, (err, data) => {
            if (!err && data) {
              cb(200, data, "html");
            } else cb(500, "<undefined>", "html");
          });
        } else cb(405, "<undefined>", "html"), console.log(err);
      });
    } else cb(405, "<undefined>", "html");
  }

  accountCreate(data: data, cb: cb) {
    if (data.method === "get") {
      const templateData = {
        "head.title": "Create An Account ",
        "head.description": "Create An Account ",
        "body.class": "index",
      };

      helpers.getTemplate(
        "accountCreate",
        templateData,
        (err, accountCreate) => {
          if (!err && accountCreate) {
            helpers.addUniversalTemplates(
              accountCreate,
              templateData,
              (err, dt) => {
                if (!err && dt) {
                  cb(200, dt, "html");
                } else cb(405, "<undefined>", "html");
              }
            );
          } else cb(405, "<undefined>", "html");
        }
      );
    }
  }
  accountEdit(data: data, cb: cb) {}
  accountDeleted(data: data, cb: cb) {}
  // (data: data, cb: cb) {

  // }

  // favicon
  favicon(data: data, cb: cb) {
    if (data.method === "get") {
      helpers.getStaticAssets("favicon.ico", (err, favicon) => {
        if (!err && favicon) {
          cb(200, favicon, "favicon");
        } else cb(500, "", undefined);
      });
    } else cb(405, "");
  }

  // public assets
  public(data: data, cb: cb) {
    if (data.method === "get") {
      let trimmedName = (data.trimmedPath as string)
        .replace("public/", "")
        .trim();

      if (trimmedName.length > 0) {
        helpers.getStaticAssets(trimmedName, (err, assets) => {
          if (!err && assets) {
            let contentType = "plain";

            if (trimmedName.indexOf(".css") > -1) contentType = "css";
            if (trimmedName.indexOf(".ico") > -1) contentType = "favicon";
            if (trimmedName.indexOf(".jpg") > -1) contentType = "jpg";
            if (trimmedName.indexOf(".png") > -1) contentType = "png";

            cb(200, assets, contentType);
          } else cb(404, " false", "plain");
        });
      } else cb(404, "false", "plain");
    } else cb(405, "");
  }
  //json
  users(data: data, cb: cb) {
    const validMethods = ["post", "put", "get", "delete"];
    const d = data.method;
    if (validMethods.indexOf(d as string) > -1) {
      // @ts-ignore
      _users()[d as string](data, cb);
    } else cb(405, "");
  }

  tokens(data: data, cb: cb) {
    const validMethods = ["post", "put", "get", "delete"];
    if (validMethods.indexOf(data.method as string) > -1)
      // @ts-ignore
      _tokens()[data.method as string](data, cb);
    else cb(405, "");
  }

  carts(data: data, cb: cb) {
    const validMethods = ["post", "put", "get", "delete"];
    if (validMethods.indexOf(data.method as string) > -1)
      // @ts-ignore
      _carts()[data.method as string](data, cb);
    else cb(405, "");
  }

  menu(data: data, cb: cb) {
    const validMethods = ["post", "put", "get", "delete"];
    if (validMethods.indexOf(data.method as string) > -1)
      // @ts-ignore
      _menu()[data.method as string](data, cb);
    else cb(405, "");
  }

  order(data: data, cb: cb) {
    const validMethods = ["post", "put", "get", "delete"];
    if (validMethods.indexOf(data.method as string) > -1)
      // @ts-ignore
      _menu()[data.method as string](data, cb);
    else cb(405, "");
  }
}

export const handlers = new Handlers();
