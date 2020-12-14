const bodyparser = require('body-parser');
const express = require('express');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const path = require('path');
const db = require('./public/db');
//bodyparser
var urlencodedParser = bodyparser.urlencoded({extended: false});
var jsonParser = bodyparser.json();
// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use('local',
  new Strategy( {
    usernameField: 'name', 
    passwordField: 'password'
  },
  function(name, password, cb) {
    db.users.findByName(name, 
      function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });}));
// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});
// Create a new Express application.
const app = express();
app.set('views', path.join(__dirname, '/views'));
app.set(express.static(path.join(__dirname, '/public')));
app.set(express.static(path.join(__dirname, '/')));
app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'ejs');
app.engine('text/html', require('ejs').renderFile);
app.use(express.static(__dirname));
// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());
// Define routes.
app.get('/', function(req, res) {
  res.render('pages/index.ejs', {user: req.user});
});
app.get('/login',
  function(req, res){
    res.render('partials/login.ejs');
  });
  app.post('/login', 
  passport.authenticate('local', { failureRedirect: 'partials/login.ejs' }),
  function(req, res) {
    res.redirect('/');
  });
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });
app.get('/add', 
function(req, res) {
  res.render('pages/add.ejs');
});
app.get('/browse', function(req, res) {
  res.render('pages/browse.ejs');
});
app.post('/addMedia', urlencodedParser, 
  async function(req, res) {
    try {
      const query = "INSERT INTO media_table (title_name, type_tv, type_film, type_other) VALUES ( 'Africa Screams', 'false', 'true', 'false')";
      const client = await pool.connect();
      await client.query(query);
      client.release();
    }
    catch (err) {
      console.error(err);
      res.send("Error" + err);
    }
  });
  app.get('/profile', 
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('partials/profile.ejs', { user: req.user });
  });

  app.get('/searchAll', 
    async function(req, res) {
      try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM media_table ORDER BY title_name ASC');
        const results = { 
          'result': (result) ? result.rows: null
        };
        res.render('pages/search.ejs', results);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});
app.get('/searchGenre/:', 
  async function(req, res) {
    try {
      let choice = filterGenre(req.body.genre_input);
      const genre = choice;
      const client = await pool.connect();
      const result = await client.query(genre);
      const results = {
        'result': (result) ? result.rows:null
      };
      res.render('pages/genre.ejs', results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  });
app.get('/searchType', 
  async function(req, res) {
    try {
      let choice = filterType(req.body.typeInput);
      const type = choice;
      const client = await pool.connect();
      const result = await client.query(type);
      const results = {
        'result': (result) ? result.rows: null
      }
      res.render('pages/type.ejs', results);
      client.release();
    } catch (err) { 
      console.error(error);
      res.send("Error " + err);
    }
  });

const {Pool} = require('pg');
const pool = new Pool({
connectionString: process.env.DATABASE_URL, 
ssl: {
  rejectUnauthorized: false
} 
});
app.listen(app.get('port'), function() {
console.log('Now listening for connections on port: ', app.get('port'));
});

function filterGenre(choice) {
  let myChoice = "";
  switch(choice) {
    case 'Action': 
      myChoice = `SELECT * FROM media_table WHERE genre_type = 'Action'`;
    break;
    case 'Science Fiction': 
      myChoice = `SELECT * FROM media_table WHERE genre_type = 'Science Fiction'`;
    break;
    case 'Fantasy':  
      myChoice = `SELECT * FROM media_table WHERE genre_type = 'Fantasy'`;
    break;
    case 'Comedy': 
      myChoice = `SELECT * FROM media_table WHERE genre_type = 'Comedy'`;
    break;
    case 'Romance': 
      myChoice = `SELECT * FROM media_table WHERE genre_type = 'Romance'`;
    break;
    case 'Western':
      myChoice = `SELECT * FROM media_table WHERE genre_type = 'Western'`; 
    break;
    case 'Anime':
      myChoice = `SELECT * FROM media_table WHERE genre_type = 'Anime'`; 
    break;
    case 'Animation': 
      myChoice = `SELECT * FROM media_table WHERE genre_type = 'Animation'`;
    break;
    case 'Drama':
      myChoice = `SELECT * FROM media_table WHERE genre_type = 'Drama'`; 
    break;
    case 'Game':
      myChoice = `SELECT * FROM media_table WHERE genre_type = 'Game'`;
    default:
      myChoice = `SELECT * FROM media_table ORDER BY genre_type`; 
    break;
  }
  return myChoice;
};

function filterType(choice) {
    let myType = "";
  switch(choice) {
    case 'film': 
      myType = `SELECT * FROM media_table WHERE media_type = 'film' ORDER BY title_name ASC`;
    break;
    case 'tv': 
      myType = `SELECT * FROM media_table WHERE media_type = 'tv' ORDER BY title_name ASC`;
    break;
    case 'game': 
      myType = `SELECT * FROM media_table WHERE media_type = 'game' ORDER BY title_name ASC`;
    break;
    default: 
      myType = `SELECT * FROM media_table ORDER BY media_type ASC`;
  }
  return myType;
};