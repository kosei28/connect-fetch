import type {
  ConnectRouter,
  ConnectRouterOptions,
  ContextValues,
} from "@connectrpc/connect";
import { createConnectRouter } from "@connectrpc/connect";
import type { UniversalHandler } from "@connectrpc/connect/protocol";
import {
  universalServerRequestFromFetch,
  universalServerResponseToFetch,
} from "@connectrpc/connect/protocol";

interface FetchHandlerOptions<Env> extends ConnectRouterOptions {
  routes: (router: ConnectRouter) => void;
  requestPathPrefix?: string;
  contextValues?: (req: Request, env: Env) => ContextValues;
  notFound?: (req: Request, env: Env) => Promise<Response>;
}

type FetchHandler<Env> = [Env] extends [undefined]
  ? (req: Request) => Promise<Response>
  : (req: Request, env: Env) => Promise<Response>;

export function createFetchHandler<Env = undefined>(
  options: FetchHandlerOptions<Env>
) {
  const router = createConnectRouter(options);
  options.routes(router);
  const prefix = options.requestPathPrefix ?? "";
  const paths = new Map<string, UniversalHandler>();
  for (const uHandler of router.handlers) {
    paths.set(prefix + uHandler.requestPath, uHandler);
  }

  const fetch = (async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const uHandler = paths.get(url.pathname);
    if (uHandler === undefined) {
      return (
        (await options.notFound?.(req, env)) ??
        new Response("Not found", { status: 404 })
      );
    }
    const uReq = {
      ...universalServerRequestFromFetch(req, {}),
      contextValues: options.contextValues?.(req, env),
    };
    const uRes = await uHandler(uReq);
    return universalServerResponseToFetch(uRes);
  }) as FetchHandler<Env>;

  return fetch;
}
