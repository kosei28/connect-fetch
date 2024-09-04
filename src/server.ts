import { createFetchHandler } from "./adapter";
import { routes } from "./connect";

const fetch = createFetchHandler({ routes });

export default { fetch };
