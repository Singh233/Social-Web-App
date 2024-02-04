const express = require("express");
const env = require("./config/environment");
const logger = require("morgan");
const cors = require("cors");
const multer = require("multer");

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://chillsaname.me",
    "http://127.0.0.1:5173",
  ],
};

// Certificate and key files
const fs = require("fs");
const https = require("https");

const options = {
  key: fs.readFileSync(env.key),
  cert: fs.readFileSync(env.certificate),
};

const cookieParser = require("cookie-parser");
const app = express();
const server = https.createServer(options, app);

require("./config/view_helper")(app);

const port = 8000;
const expressLayouts = require("express-ejs-layouts");
const db = require("./config/mongoose");
// used for session cookie
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");
const passportJWT = require("./config/passport-jwt-strategy");
const passportGoogle = require("./config/passport-google-oauth2-strategy");

const bodyParser = require("body-parser");

// sass
const sassMiddleware = require("node-sass-middleware");

const MongoStore = require("connect-mongo");

const flash = require("connect-flash");
const customMware = require("./config/middleware");

const path = require("path");

// setup the chat server to be used with socket.io
const chatServer = require("https").Server(server);
require("./config/chat_sockets").chatSockets(chatServer);

chatServer.listen(4000);
console.log("chat server is listening on port 4000");

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    // no larger than 100MB.
    fileSize: 100 * 1024 * 1024,
  },
});

app.use(multerMid.single("filepond"));

app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "https://chillsanam.me",
      "https://react.chillsanam.social",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://localhost:4173",
      "http://localhost:5173",
      "http://192.168.0.5:5173",
      "http://192.168.0.8:5173",
    ],
  })
);

// compiles scss to css
if (env.name === "development") {
  // app.use(sassMiddleware({
  //     src: path.join(__dirname, env.asset_path, 'scss'),
  //     dest: path.join(__dirname, env.asset_path, 'css'),
  //     debug: false,
  //     outputStyle: 'expanded',
  //     prefix: '/css'
  // }));
  // console.log(path.join(__dirname, env.asset_path, 'scss'))

  app.use(
    sassMiddleware({
      src: "./assets/scss",
      dest: "./assets/css",
      debug: false,
      outputStyle: "expanded",
      prefix: "/css",
    })
  );
}

app.use(express.static(env.asset_path));

app.use(cookieParser());

// make the uploads path avaialble to the browser
app.use("/uploads", express.static(`${__dirname}/uploads`));

// app.use(logger(env.morgan.mode, env.morgan.options));

app.use(expressLayouts);
// extracct style and scripts from sub pages int the layout
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

// set up view engine
app.set("view engine", "ejs");
app.set("views", "./views");

// mongo store is use to store the session cookie in the db
const sessionMiddleware = session({
  name: "codeial",
  // TODO change the secret before deployment in production mode
  secret: env.session_cookie_key,
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 1000 * 60 * 100,
  },
  store: MongoStore.create(
    {
      mongoUrl: env.db,
      autoRemove: "enabled",
    },
    function (error) {
      console.log(error || "---connect-mongodb setup ok---");
    }
  ),
});

let isApiRequest = false;
// Dynamically set the session middleware
app.use(function (req, res, next) {
  if (req.url.startsWith("/api")) {
    // console.log('Skipping session middleware for API requests')
    isApiRequest = true;
  } else {
    // console.log('Using session middleware for non-API requests')
    isApiRequest = false;
  }
  next();
});

if (!isApiRequest) {
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(passport.setAuthenticatedUser);

  app.use(flash());
  app.use(customMware.setFlash);
} else {
  app.use(passport.initialize());
}

// use express router
app.use("/", require("./routes"));

// Catch-all route for undefined routes
app.use(function (req, res, next) {
  // Create a 404 Not Found error
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Error-handling middleware
app.use(function (err, req, res, next) {
  // Handle the error in a way that suits your application
  res.redirect("/home"); // Redirect to the home page for 404 errors
});

app.listen(port, function (error) {
  if (error) {
    console.log("Error: ", error);
    console.log(`Error in running the server: ${error}`);
  }
  console.log(`Server is up and running on port: ${port}`);
});
