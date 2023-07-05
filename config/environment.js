// eslint-disable-next-line no-unused-vars
const development = {
  name: "development",
  asset_path: "./assets",
  session_cookie_key: "blahsomething",
  db: process.env.CODIEAL_DEVELOPMENT_DB,
  smtp: {
    host: "smtp.mail.me.com",
    service: "iCloud",
    port: 587,
    secure: false,
    auth: {
      user: process.env.CODEIAL_GMAIL_USERNAME,
      pass: process.env.CODEIAL_GMAIL_PASSWORD,
    },
  },
  google_clientID: process.env.CODEIAL_GOOGLE_CLIENT_ID,
  google_clientSecret: process.env.CODEIAL_GOOGLE_CLIENT_SECRET,
  google_callbackURL: process.env.CODEIAL_GOOGLE_CALLBACK_URL,
  jwt_secret: "codeial",
  certificate: process.env.CODEIAL_CERTIFICATE,
  key: process.env.CODEIAL_CERTIFICATE_KEY,
  websocket_host: "https://localhost:4000",
  // morgan: {
  //     mode: 'dev',
  //     options: { stream: accessLogStream }
  // }
};

// eslint-disable-next-line no-unused-vars
const production = {
  name: "production",
  asset_path: process.env.CODEIAL_ASSET_PATH,
  session_cookie_key: process.env.CODEIAL_SESSION_KEY,
  db: process.env.CODIEAL_PRODUCTION_DB,
  smtp: {
    host: "smtp.mail.me.com",
    service: "iCloud",
    port: 587,
    secure: false,
    auth: {
      user: process.env.CODEIAL_GMAIL_USERNAME,
      pass: process.env.CODEIAL_GMAIL_PASSWORD,
    },
  },
  google_clientID: process.env.CODEIAL_GOOGLE_CLIENT_ID,
  google_clientSecret: process.env.CODEIAL_GOOGLE_CLIENT_SECRET,
  google_callbackURL: "https://sanam.social/users/auth/google/callback",
  jwt_secret: process.env.CODEIAL_JWT_SECRET,
  certificate: process.env.CODEIAL_CERTIFICATE,
  key: process.env.CODEIAL_CERTIFICATE_KEY,
  websocket_host: `https://sanam.social`,
  // morgan: {
  //     mode: 'combined',
  //     options: { stream: accessLogStream }
  // }
};

module.exports = development;
