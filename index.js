const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8000;
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');
// used for session cookie
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const MongoStore = require('connect-mongo');

const flash = require('connect-flash');
const customMware = require('./config/middleware');


// sass
const sassMiddleware = require('node-sass-middleware');

// compiles scss to css
app.use(sassMiddleware({
    src: './assets/scss',
    dest: './assets/css',
    debug: true,
    outputStyle: 'expanded',
    prefix: '/css'
}))

app.use(express.urlencoded());

app.use(cookieParser());

app.use(express.static('./assets'));

// make the uploads path avaialble to the browser
app.use('/uploads', express.static(__dirname + '/uploads'));


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
    secret: 'blahsomething',
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