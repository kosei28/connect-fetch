import { createContextKey, type ConnectRouter } from "@connectrpc/connect";
import { ElizaService } from "../../gen/connectrpc/eliza/v1/eliza_connect";

export type User = { name: string };

export const kUser = createContextKey<User | undefined>(undefined, {
  description: "Authenticated user",
});

export const routes = (router: ConnectRouter) =>
  router.service(ElizaService, {
    async say(req, context) {
      const user = context.values.get(kUser);
      const userName = user !== undefined ? user.name : "You";
      return {
        sentence: `${userName} said: ${req.sentence}`,
      };
    },
  });
