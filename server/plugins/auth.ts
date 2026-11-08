import { createToolkitAuthPlugin } from "@agent-native/toolkit/app/auth/server";

export default createToolkitAuthPlugin({
  workspaceAppPublicPaths: ["/"],
  // `/` is the public landing page; sign-in lives at /sign-in and /signup.
  rootAuth: false,
  marketing: false,
});
