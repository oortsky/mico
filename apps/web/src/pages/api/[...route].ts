import app from "../../server/app";

export const prerender = false;

export const ALL = ({ request }) => {
  return app.fetch(request);
};