import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  index("routes/welcome.tsx"),
  layout("layouts/auth.tsx", [
    route("signup", "routes/signup.tsx"),
    route("signin", "routes/signin.tsx"),
  ]),
  layout("layouts/dashboard.tsx", [
    route("contacts", "routes/contacts.tsx", [
      index("routes/select-contact.tsx"),
    ]),
  ]),
  ...prefix("resources", [route("signout", "resources/signout.tsx")]),
] satisfies RouteConfig;
