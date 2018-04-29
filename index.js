var express = require('express');
var app = express();
const session = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');


// session support is required to use ExpressOIDC
app.use(session({
  secret: 'this should be secure',
  resave: true,
  saveUninitialized: false
}));

const oidc = new ExpressOIDC({
  issuer: 'https://dev-172233.oktapreview.com/oauth2/default',
  client_id: '0oaeuvvp3pUGLPYTS0h7',
  client_secret: 'PMiYXiKYL-TE5De3GhrlczMSxKxBN8MukvP2fM31',
  redirect_uri: 'http://localhost:3000/',
  scope: 'openid profile'
});

// ExpressOIDC will attach handlers for the /login and /authorization-code/callback routes
app.use(oidc.router);


oidc.on('ready', () => {
  app.listen(3000, () => console.log(`Started!`));
});

oidc.on('error', err => {
  console.log('Unable to configure ExpressOIDC', err);
});


app.get('/', function(req, res){
   res.send("Hello world!");
});


app.set('view engine', 'pug');
app.set('views','./views');


app.get('/first_template', function(req, res){
   res.render('first_view');
});



