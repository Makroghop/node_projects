const confirm$ = (payload: any, code: number, cb: any) => {
  return typeof cb === "function" ? cb(code, payload) : payload;
};

// export default confirm$;
