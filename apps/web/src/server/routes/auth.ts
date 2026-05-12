import { Hono } from "hono";

import { env } from "../config/env";

const auth = new Hono();

auth.get("/auth/github", async (c) => {
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: env.githubClientId,
    redirect_uri: env.githubRedirectUri,
    scope: "read:user user:email",
    state,
  });

  c.header(
    "Set-Cookie",
    [
      `github_oauth_state=${state}`,
      "Path=/",
      "HttpOnly",
      "Secure",
      "SameSite=Lax",
      "Max-Age=600",
    ].join("; ")
  );

  return c.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  );
});

auth.get("/auth/callback/github", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");

  const cookie = c.req.header("cookie") || "";

  const savedState = cookie
    .split("; ")
    .find((v) => v.startsWith("github_oauth_state="))
    ?.split("=")[1];

  if (!code || !state || state !== savedState) {
    return c.html(`
      <script>
        window.opener.postMessage(
          {
            type: "github:error",
            error: "Invalid OAuth state"
          },
          "${env.appOrigin}"
        );

        window.close();
      </script>
    `);
  }

  try {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: env.githubClientId,
          client_secret: env.githubClientSecret,
          code,
          redirect_uri: env.githubRedirectUri,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error("Missing access token");
    }

    return c.html(`
      <script>
        window.opener.postMessage(
          {
            type: "github:success",
            provider: "github",
            token: ${JSON.stringify(tokenData.access_token)}
          },
          "${env.appOrigin}"
        );

        window.close();

        setTimeout(() => {
          document.body.innerHTML =
            "Authentication complete. You can close this window.";
        }, 1000);
      </script>
    `);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "OAuth failed";

    return c.html(`
      <script>
        window.opener.postMessage(
          {
            type: "github:error",
            error: ${JSON.stringify(message)}
          },
          "${env.appOrigin}"
        );

        window.close();
      </script>
    `);
  }
});

export default auth;