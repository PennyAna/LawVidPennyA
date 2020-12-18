const bodyParser = require('body-parser');
const express = require('express');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const path = require('path');
const db = require('./db');

const app = express();
//bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

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
// Define routes
app.get('/', function(req, res) {
  res.render('pages/index.ejs');
});
app.get('/browse',
   function(req, res){
     res.render('pages/browse.ejs');
   });
app.post('/browse', 
  passport.authenticate('local', { failureRedirect: '/' }),
  function(req, res) {
    res.render('pages/browse.ejs');
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
app.get('/searchAll', async function(req, res) {
    try {   
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM media_table');
        const results = { 'result': (result) ? result.rows: null};
        if (results) {
            res.render('pages/genre.ejs', results);
            }
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
})
app.get('/searchType', async function(req, res) {
    try {   
        const client = await pool.connect();
        const result = await client.query(`SELECT * FROM media_table WHERE media_type = 'film'`);
        const results = { 'result': (result) ? result.rows: null};
        if (results) {
            res.render('pages/type.ejs', results);
            }
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
})
app.get('/searchGenre', async function(req, res) {
    try {   
        const client = await pool.connect();
        const result = await client.query(`SELECT * FROM media_table WHERE genre_type = 'Action'`);
        const results = { 'result': (result) ? result.rows: null};
        if (results) {
        res.render('pages/genre.ejs', results);
        }
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
})
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