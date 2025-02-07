import { index, type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default [
  index("routes/welcome.tsx"),
  ...(await flatRoutes({ rootDirectory: "./flat-routes" })),
] satisfies RouteConfig;
