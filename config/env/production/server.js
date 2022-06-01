module.exports = ({ env }) => {
  return {
    host: env("HOST", "0.0.0.0"),
    port: env.int("PORT", 1337),
    admin: {
      auth: {
        secret: env("ADMIN_JWT_SECRET", ""),
      },
    },
    url: "https://portal.waytoogood.com",
  };
};
