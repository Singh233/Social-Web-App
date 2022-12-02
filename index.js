const express = require('express');
const env = require('./config/environment');
const logger = require('morgan');

const cookieParser = require('cookie-parser');
const app = express();
require('./config/view_helper')(app);

const port = 8000;
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');
// used for session cookie
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const passportJWT = require('./config/passport-jwt-strategy');
const passportGoogle = require('./config/passport-google-oauth2-strategy');

const bodyParser = require('body-parser');

// sass
const sassMiddleware = require('node-sass-middleware');


const MongoStore = require('connect-mongo');

const flash = require('connect-flash');
const customMware = require('./config/middleware');

const path = require('path');

// setup the chat server to be used with socket.io
const chatServer = require('http').Server(app);
const chatSockets = require('./config/chat_sockets').chatSockets(chatServer);
chatServer.listen(4000);
console.log('chat server is listening on port 4000');


// app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
// app.use(bodyParser.json()); // Send JSON responses

// compiles scss to css
if(env.name == 'development') {
    app.use(sassMiddleware({
        src: path.join(__dirname, env.asset_path, 'scss'),
        dest: path.join(__dirname, env.asset_path, 'css'),
        debug: true,
        outputStyle: 'expanded',
        prefix: '/css'
    }));
}


app.use(express.urlencoded({extended: false}));

app.use(cookieParser());

app.use(express.static(env.asset_path));

// make the uploads path avaialble to the browser
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(logger(env.morgan.mode, env.morgan.options));

app.use(expressLayouts);
// extracct style and scripts from sub pages int the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);




// set up view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// mongo store is use to store the session cookie in the db
app.use(session({
    name: 'codeial',
    // TODO change the secret before deployment in production mode
    secret: env.session_cookie_key,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100)
    },
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost/codeial_development',
        autoRemove: 'disabled'
    },
    function(error) {
        console.log(error || "---connect-mongodb setup ok---")
    })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

app.use(flash());
app.use(customMware.setFlash);

// use express router
app.use('/', require('./routes'));

app.listen(port, function(error) {
    if (error) {
        console.log('Error: ', error);
        console.log(`Error in running the server: ${error}`);
    }
    console.log(`Server is up and running on port: ${port}`);
})