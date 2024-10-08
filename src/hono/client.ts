import { createPromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { ElizaService } from "../../gen/connectrpc/eliza/v1/eliza_connect";

const transport = createConnectTransport({
  baseUrl: "http://localhost:3000/hono-connect",
});
const client = createPromiseClient(ElizaService, transport);

const res = await client.say({ sentence: "I feel happy." });
console.log(res);
