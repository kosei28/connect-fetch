import { connectFetchAdapter, universalHandlerPaths } from "./adapter";
import routes from "./connect";

const paths = universalHandlerPaths({ routes });

export default {
  fetch: connectFetchAdapter({ paths }),
};
