import { handlers } from "./handlers";

const routes = {
  "": handlers.index,
  "default": handlers.default,
  "hello": handlers.hello,
  "index": handlers.index,
  "account/create": handlers.accountCreate,
  "account/edit": handlers.accountEdit,
  "account/deleted": handlers.accountDeleted,
  "api/users": handlers.users,
  "api/tokens": handlers.tokens,
  "api/menu": handlers.menu,
  "api/cart": handlers.carts,
  "favicon.ico": handlers.favicon,
  "public/app.css": handlers.public,
  "public": handlers.public,
};
export default routes;
