import { createContextValues } from "@connectrpc/connect";
import { Context, Hono, Next } from "hono";
import { createFetchHandler } from "../adapter";
import { kUser, routes, User } from "./connect";

type HonoEnv = {
  Variables: { user?: User };
};

const connectHandler = createFetchHandler<{
  c: Context<HonoEnv>;
  next: Next;
}>({
  routes,
  requestPathPrefix: "/hono-connect",
  contextValues(_req, { c }) {
    return createContextValues().set(kUser, c.var.user);
  },
  notFound: async (_req, { c, next }) => {
    await next();
    return c.res;
  },
});

const app = new Hono<HonoEnv>();

app.use(async (c, next) => {
  c.set("user", { name: "Alice" });
  await next();
});

app.use((c, next) => {
  return connectHandler(c.req.raw, { c, next });
});

app.get("/", (c) => {
  return c.text("Hello World");
});

export default app;
