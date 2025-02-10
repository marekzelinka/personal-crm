import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default [
  index("routes/welcome.tsx"),
  layout("layouts/auth.tsx", [
    route("signup", "routes/signup.tsx"),
    route("signin", "routes/signin.tsx"),
    // route("signin", "routes/signin.tsx"),
    // route("forgot-password", "routes/forgot-password.tsx"),
    // route("reset-password", "routes/reset-password.tsx"),
  ]),
  ...prefix("resources", [route("signout", "resources/signout.tsx")]),
  ...(await flatRoutes({ rootDirectory: "./flat-routes" })),
] satisfies RouteConfig;
