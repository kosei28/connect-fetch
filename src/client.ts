import { createPromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { ElizaService } from "../gen/connectrpc/eliza/v1/eliza_connect";

const transport = createConnectTransport({
  baseUrl: "http://127.0.0.1:3000",
});
const client = createPromiseClient(ElizaService, transport);

const res = await client.say({ sentence: "I feel happy." });
console.log(res);
