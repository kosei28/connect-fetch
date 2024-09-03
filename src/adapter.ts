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
  uResponseNotFound,
} from "@connectrpc/connect/protocol";

type UniversalHandlerPathsOptions = ConnectRouterOptions & {
  routes: (router: ConnectRouter) => void;
  requestPathPrefix?: string;
};

type UniversalHandlerPathsMap = Map<string, UniversalHandler>;

export function universalHandlerPaths(
  options: UniversalHandlerPathsOptions
): UniversalHandlerPathsMap {
  const router = createConnectRouter(options);
  options.routes(router);
  const prefix = options.requestPathPrefix ?? "";
  const paths: UniversalHandlerPathsMap = new Map();
  for (const uHandler of router.handlers) {
    paths.set(prefix + uHandler.requestPath, uHandler);
  }
  return paths;
}

type ConnectFetchAdapterOptions = {
  paths: UniversalHandlerPathsMap;
  httpVersion?: string;
  contextValues?: ContextValues;
};

type FetchHandlerFn = (req: Request) => Promise<Response>;

export function connectFetchAdapter(
  options: ConnectFetchAdapterOptions
): FetchHandlerFn {
  return async (req) => {
    const url = new URL(req.url);
    const uHandler = options.paths.get(url.pathname);
    if (!uHandler) {
      return universalServerResponseToFetch(uResponseNotFound);
    }
    const uReq = universalServerRequestFromFetch(req, {
      httpVersion: options.httpVersion,
    });
    uReq.contextValues = options.contextValues; // universalServerRequestFromFetch does not have contextValues option
    const uRes = await uHandler(uReq);
    return universalServerResponseToFetch(uRes);
  };
}
