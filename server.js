const express = require('express');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const path = require('path');
const db = require('./db');
// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use('local',
  new Strategy(
  function(name, password, cb) {
    db.users.findByDisplayName(name, 
      function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });}));
/* passport.use('my-simple-login-strategy',
  new Strategy(
  STRAT_CONFIG,
  function(email, password, cb) {
    db.users.findUserByEmailPass(email, password, 
      function (err, userFoundByDB) {
      if (err) {return cb(err);}
      if (!userFoundByDB) {return cb(null, false);}
      console.log('... ' + JSON.stringify(userFoundByDB))
      return cb(null, userFoundByDB)
    });}));
passport.use('my-simple-createaccount-strategy', 
  new Strategy(
    STRAT_CONFIG, 
    function(email, password, cb) {
      db.simpleCreate(email, password, function(err, trueOrFalse) {
        if (err) {return cb(err);}
        if (!trueOrFalse) {return cb(null, false);}
        return cb(null, trueOrFalse)
      });})); */
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
app.set(express.static(path.join(__dirname, '/views')));
app.set(express.static(path.join(__dirname, '/public')));
app.set(express.static(path.join(__dirname, '/')));
app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/',
  function(req, res) {
    res.render('pages/home.ejs', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });
  
app.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), function(req, res) {res.redirect('/');});
/* app.post('/login', 
  passport.authenticate('my-simple-login-strategy', { failureRedirect: 'pages/login.ejs' }),
  function(req, res) {
    res.redirect('/');
  });
app.post('/createaccount', urlencodedParser, 
  passport.authenticate('my-simple-createaccount-strategy', {
    failureRedirect: '/createaccount'}), 
    function(req, res) {
      res.redirect('login');
  }); */
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('pages/profile.ejs', { user: req.user });
  });
  
  app.get('/main', 
  async function(req, res) {
  try {
      const client = await pool.connect();
      const tableOne = await client.query('SELECT * FROM test_table');
      const tableTwo = await client.query('SELECT * FROM media_table');
      const tableThree = await client.query('SELECT * FROM login_table');
      const tableFour = await client.query('SELECT * FROM genre_table');
      const results = { 
          'tableOne': (tableOne) ? tableOne.rows: null,
          'tableTwo': (tableTwo) ? tableTwo.rows: null,
          'tableThree': (tableThree) ? tableThree.rows: null, 
          'tableFour': (tableFour) ? tableFour.rows: null
      };
      res.render('pages/main.ejs', results);
      client.release();
  } catch (err) {
  console.error(err);
  res.send("Error " + err);
  }});//=main
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