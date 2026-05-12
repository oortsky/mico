export const env = {
  githubClientId: process.env.GITHUB_CLIENT_ID!,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET!,
  githubRedirectUri: process.env.GITHUB_REDIRECT_URI!,
  appOrigin:
    process.env.NODE_ENV === "production"
      ? "https://mico-web.vercel.app"
      : "http://localhost:4321",
};