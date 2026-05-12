import { Hono } from "hono";

const auth = new Hono();

auth.get("/auth/github", c => {
  const clientId = process.env.GITHUB_CLIENT_ID!;
  const redirectUri = process.env.GITHUB_REDIRECT_URI!;

  const authURL = new URL("https://github.com/login/oauth/authorize");

  authURL.searchParams.set("client_id", clientId);
  authURL.searchParams.set("redirect_uri", redirectUri);
  authURL.searchParams.set("scope", "repo user");

  return c.redirect(authURL.toString());
});

auth.get("/auth/callback/github", async c => {
  const clientId = process.env.GITHUB_CLIENT_ID!;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET!;
  const redirectUri = process.env.GITHUB_REDIRECT_URI!;

  const code = c.req.query("code");

  if (!code) {
    return c.html(`
      <script>
        window.opener.postMessage(
          { error: "Missing code" },
          "*"
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri
        })
      }
    );

    const tokenData = await tokenResponse.json();

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("Missing access token");
    }

    const content = JSON.stringify({
      token: accessToken,
      provider: "github"
    });

    const message = JSON.stringify(`authorization:github:success:${content}`);

    return c.html(`
      <html>
        <body>
          <script>
            (function() {
              function receiveMessage(event) {
                console.log("receiveMessage", event);

                window.opener.postMessage(
                  ${message},
                  event.origin
                );

                setTimeout(() => {
                  window.close();
                }, 300);
              }

              window.addEventListener(
                "message",
                receiveMessage,
                false
              );

              window.opener.postMessage(
                "authorizing:github",
                "*"
              );
            })();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    const message = JSON.stringify("authorization:github:error:OAuth failed");

    return c.html(`
      <html>
        <body>
          <script>
            (function() {
              function receiveMessage(event) {
                window.opener.postMessage(
                  ${message},
                  event.origin
                );

                setTimeout(() => {
                  window.close();
                }, 300);
              }

              window.addEventListener(
                "message",
                receiveMessage,
                false
              );

              window.opener.postMessage(
                "authorizing:github",
                "*"
              );
            })();
          </script>
        </body>
      </html>
    `);
  }
});

export default auth;
