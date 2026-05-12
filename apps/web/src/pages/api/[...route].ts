import app from "../../server/app";

export const ALL = ({ request }) => {
  return app.fetch(request);
};
